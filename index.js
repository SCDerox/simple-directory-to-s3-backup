const config = require('./config.json');
const schedule = require('node-schedule');
const aws = require('aws-sdk');
const fs = require('fs');
const execSync = require('child_process').execSync;

if (config.enabledHourlyUpload) {
    schedule.scheduleJob('1 * * * *', function () {
        if (config.limitHoursTo && config.limitHoursTo.length !== 0) {
            if (config.limitHoursTo.includes(new Date().getHours().toString())) backup();
        } else backup();
    });
}

const s3bucket = new aws.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    s3BucketEndpoint: config.s3BucketEndpoint,
    endpoint: config.endpoint,
    region: config.bucketRegion
});


async function backup() {
    return new Promise((async resolve => {
        for (const command of config.runCommandsBeforeExecution || []) {
            console.log(`Running ${command}`);
            try {
                await execSync(command);
            } catch (e) {
                console.warn(`Error executing ${command}`);
            }
            console.log(`Finished running ${command}`);
        }
        console.log('Backing up...');
        const date = new Date();
        const filename = `backup-${config.prefix}-${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}.zip`;
        for (const folder of config.folders) {
            console.log(`Adding ${folder} to zip...`);
            try {
                await execSync(`cd ${config.rootDir || '.'} && zip -q -P \"${config.key}\" -r ${__dirname}/${filename} ${folder}`);
                console.log(`Added ${folder}`);
            } catch (e) {
                console.error(`Error adding `, e);
            }
        }
        const readStream = fs.createReadStream(`./${filename}`);
        s3bucket.upload({
            Bucket: config.bucketID,
            Key: config.path + '/' + `${filename}`,
            Body: readStream,
            ServerSideEncryption: 'AES256',
            StorageClass: 'STANDARD_IA'
        }, function (err) {
            fs.unlinkSync(`${__dirname}/${filename}`);
            if (err) return console.error(`Error uploading:`, err);
            console.log('Uploaded successfully');
        });
        if (config.deleteItems) {
            s3bucket.listObjects({Bucket: config.bucketID, Prefix: `${config.path}`}, (err, res) => {
                if (err) return;
                for (const object of res.Contents) {
                    if (object.LastModified.getTime() + (config.daysBeforeDeletion * 86400000) < new Date().getTime()) {
                        console.log(`Deleting ${object.Key}...`);
                        s3bucket.deleteObject({Bucket: config.bucketID, Key: object.Key}, (err, data) => {
                            if (err) return console.error(`Error deleting: ${err}`);
                            console.log(`Successfully deleted`);
                        });
                    }
                }
            });
        }
    }));
}

if (config.backupOnStart) backup();