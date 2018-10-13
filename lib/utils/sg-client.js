const TelnetClient = require('telnet-client');
const { DOMParser } = require('xmldom');

let connection;
let connectOpts = {
    port: 8080,
    shellPrompt: '',
    timeout: 5000
};
const sendOpts = {
    shellPrompt: '>'
};

function parseSGXML(str) {
    // Remove extra lines and trim whitespaces from telnet output 
    str = str.substring(str.indexOf("\n")+1, str.lastIndexOf("\n")).replace(/>\s*</g, '><');
    const xmlParser = new DOMParser();
    return xmlParser.parseFromString(str, 'application/xml');
}

const SGClient = {
    connect(host) {
        connectOpts.host = host;
        connection = new TelnetClient();
        connection.on('error', err => {
            connection.destroy();
            throw new Error(`[SGClient] Connection error: ${err}`);
        });
        return connection.connect(connectOpts);
    },
    async send(cmd) {
        try {
            const response = await connection.send(`sgnodes ${cmd}`, sendOpts);
            return parseSGXML(response);
        } catch(err) {
            throw new Error(`[SGClient] ${err}`);
        }
    },
    disconnect() {
        connection.end();
    }
}

module.exports = SGClient;
