const fs = require('fs');
const archiver = require('archiver');
const request = require('request-promise-native');

const ZipUtil = (sourceFolder, buildPath, host, devPassword) => {
    return {
        build() {
            return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(buildPath);
                const zip = archiver('zip', {
                    zlib: { 
                        level: 9 
                    }
                });
                output.on('error', err => {
                    reject(new Error(`[ZipUtil] Failed to write stream: ${err}`));
                });
                output.on('close', () => {
                    console.log(`Zip created at ${buildPath} (${zip.pointer()} total bytes)`);
                    resolve();
                });
                zip.on('error', err => {
                    reject(new Error(`[ZipUtil] Failed to create zip: ${err}`));
                });
                zip.pipe(output);
                zip.directory(sourceFolder, false);
                zip.finalize();
            });
        },
        upload() {
            const options = {
                method: 'POST',
                uri: `http://${host}/plugin_install`,
                auth: {
                    user: 'rokudev',
                    pass: devPassword,
                    sendImmediately: false
                },
                formData: {
                    mysubmit: 'Install',
                    archive: fs.createReadStream(buildPath)
                }
            };
            console.log(`Installing zip to host ${host}`);
            return request(options)
                .then(resp => {
                    console.log(`Installed on host ${host}`);
                })
                .catch(err => {
                    throw new Error(`[ZipUtil] Upload failed: ${err}`);
                });
        }
    };
};

module.exports = ZipUtil;
