const request = require('request-promise-native');
const Condition = require('./condition');

class SGDriver {
    constructor(host, client, devPassword) {
        this.host = host;
        this.client = client;
        this.devPassword = devPassword;
    }
    async connect(host = this.host) {
        this.host = host;
        await this.client.connect(this.host);
    }
    sendKey(key, timeout = 300) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: `http://${this.host}:8060/keypress/${key}`
            };
            request(options).catch(err => reject(err));
            setTimeout(() => resolve(), timeout);
        });
    }
    async sendKeys(keys, interval) {
        for (let key of keys) {
            await this.sendKey(key, interval);
        }
    }
    async _getRoot() {
        const document = await this.client.send('all');
        if (typeof document === 'undefined' || typeof document.documentElement === 'undefined') {
            throw new Error('Document element is undefined');
        }
        return document.documentElement;
    }
    _getElementsByName(document, value) {
        const childNodes = Object.values(document.childNodes);
        const result = childNodes.reduce((acc, element) => {
            if (typeof element === 'object' && element.hasAttribute('name') && element.getAttribute('name') === value) {
                acc.push(element);
            }
            return acc;
        }, []);
        return result;
    }
    _getElementsByTagName(document, value) {
        return document.getElementsByTagName(value);
    }
    async findElement(locator) {
        const elements = this.findElements(locator);
        return elements && elements.length > 0 ? elements[0] : null;
    }
    async findElements(locator) {
        const document = await this._getRoot();
        switch(locator.using) {
            case 'id':
            case 'name':
                return this._getElementsByName(document, locator.value);
            case 'tagName':
                return this._getElementsByTagName(document, locator.value);
            default: 
                throw new Error('Invalid selector used');
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    wait(condition, timeout = 0) {
        if (typeof timeout !== 'number' || timeout < 0) {
            throw new Error(`Timeout must be a number >= 0: ${timeout}`);
        }
        if (!(condition instanceof Condition)) {
            throw new Error('Wait condition must be a <Condition> object');
        }
        const message = condition.description;
        const fn = condition.fn;
        const self = this;
        function evalCondition() {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn(self));
                } catch(err) {
                    reject(err);
                }
            });
        }
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const pollCondition = async () => {
                try {
                    const result = await evalCondition();
                    const elapsedTime = Date.now() - startTime;
                    if (Boolean(result)) {
                        resolve(result);
                    } else if (timeout && elapsedTime >= timeout) {
                        reject(new Error(`Wait timed out after ${elapsedTime}ms`));
                    } else {
                        setTimeout(pollCondition);
                    }
                } catch(err) {
                    reject(err);
                }
            };
            pollCondition();
            console.log(message);
        });
    }
    async takeScreenshot() {
        const nowSeconds = Math.round(Date.now() / 1000);
        const authOptions = {
            user: 'rokudev',
            pass: this.devPassword,
            sendImmediately: false
        };
        const postOptions = {
            method: 'POST',
            uri: `http://${this.host}/plugin_inspect`,
            auth: authOptions,
            formData: {
                mysubmit: 'Screenshot',
                archive: '',
                passwd: ''
            }
        };
        const getOptions = {
            method: 'GET',
            uri: `http://${this.host}/pkgs/dev.jpg?time=${nowSeconds}`,
            auth: authOptions,
            resolveWithFullResponse: true,
            encoding: null
        };
        await request(postOptions);
        const response = await request(getOptions);
        return response.body;
    }
    disconnect() {
        this.client.disconnect();
    }
}

module.exports = SGDriver;
