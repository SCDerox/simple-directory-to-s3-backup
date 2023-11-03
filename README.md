# Simple directory to S3 
## Features
* This system will backup folders and upload them to your s3 bucket
* Every backup is encrypted using [cryptify](https://www.npmjs.com/package/cryptify)
* Backups can automatically done every hour
* Backups can automatically be deleted from your S3-Bucket every x days

## Should I use this?
Probably not tbh. It's quite complicated to set up, and the project only hase a very small and specific use-case. 
`Why is it called "Simple.." if it's complicated to set up? ~ I am very glad you asked, it's because the code is quite simple and it took not a very long time to develop this "thing".`

## Installation
Make sure you have `zip` installed on your system: `apt install zip`.

1. Clone this repo: `git clone https://github.com/SCDerox/simple-directory-to-s3-backup.git`
2. Install dependencies `npm ci`
3. Set up a S3-Bucket on AWS
4. Create a configuration-file called `config.json` in the cloned directory and change the configure parameters (explained below).
5. Then start the script as described below. 

## Start the system
* If you only want to back up once run `npm start` in the cloned directory
* To ensure that backups are performed hourly, I suggest to use [pm2](https://pm2.keymetrics.io/): `pm2 start index.js`

## Configure
You can change these parameters in the `config.json` you created earlier.
* `key`: Password with which the ZIP should be encrypted
* `prefix`: Optional prefix which should be put before every filenname
* `path`: Path on your S3-Bucket in which the backup should be saved
* `enabledHourlyUpload`: If enabled the script will backup your files hourly
* `limitHoursTo`: Array of strings; Hours to limit the hourly upload to
* `folders`: Array of the following paths that should get backed up
* `runCommandsBeforeExecution`: Array of commands to run before execution (for example `mysqldump`or something)
* `bucketID`: ID of your S3-Bucket
* `accessKeyID`: ID of your access-key
* `secretAccessKey`: Secret of your access-key
* `deleteItems`: If enabled, items will be deleted automatically (in the specified folder) if they are older than `daysBeforeDeletion`


## How do I decrypt the encrypted file?
You can simply use the [cryptify](https://www.npmjs.com/package/cryptify) -cli and remove the `.crypt`-extension from the filename.