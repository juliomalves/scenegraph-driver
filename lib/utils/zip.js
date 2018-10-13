const fs = require('fs');
const archiver = require('archiver');
const request = require('request-promise-native');

class Zip {
    constructor(options) {
        const { host, sourceFolder, buildPath, devPassword } = options;
        this.host = host;
        this.devPassword = devPassword;
        this.sourceFolder = sourceFolder;
        this.buildPath = buildPath;
    }
    archive(source, target) {
        this.sourceFolder = source || this.sourceFolder;
        this.buildPath = target || this.buildPath;
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(this.buildPath);
            const zip = archiver('zip', {
                zlib: { 
                    level: 9 
                }
            });
            output.on('error', err => {
                reject(new Error(`[ZipUtil] Failed to write stream: ${err}`));
            });
            output.on('close', () => {
                console.info(`Zip created at ${this.buildPath} (${zip.pointer()} total bytes)`);
                resolve();
            });
            zip.on('error', err => {
                reject(new Error(`[ZipUtil] Failed to create zip: ${err}`));
            });
            zip.pipe(output);
            zip.directory(this.sourceFolder, false);
            zip.finalize();
        });
    }
    async upload(host, password) {
        this.host = host || this.host;
        this.devPassword = password || this.devPassword;
        const options = {
            method: 'POST',
            uri: `http://${this.host}/plugin_install`,
            auth: {
                user: 'rokudev',
                pass: this.devPassword,
                sendImmediately: false
            },
            formData: {
                mysubmit: 'Install',
                archive: fs.createReadStream(this.buildPath)
            }
        };
        console.info(`Installing zip to host ${this.host}`);
        try {
            await request(options);
            console.info(`Installed on host ${this.host}`);
        } catch(err) {
            throw new Error(`[ZipUtil] Upload failed: ${err}`);
        }
    }
}

module.exports = Zip;
