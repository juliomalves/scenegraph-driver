const request = require('request-promise-native');

class Condition {
    constructor(message, fn) {
        this.description = `Waiting ${message}`;
        this.fn = fn;
    }
}

class SGDriver {
    constructor(host, client, devPassword) {
        this.host = host;
        this.client = client;
        this.devPassword = devPassword;
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
        const elements = findElements(locator);
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
            throw Error(`Timeout must be a number >= 0: ${timeout}`);
        }

        if (!(condition instanceof Condition)) {
            throw new Error('Wait condition must be a <Condition> object');
        }

        const message = condition.description;
        const fn = condition.fn;
        const driver = this;

        function evalCondition() {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn(driver));
                } catch (err) {
                    reject(err);
                }
            });
        }
    
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const pollCondition = async () => {
                evalCondition().then(value => {
                    const elapsed = Date.now() - startTime;
                    if (!!value) {
                        resolve(value);
                    } else if (timeout && elapsed >= timeout) {
                        reject(new Error(`Wait timed out after ${elapsed}ms`));
                    } else {
                        setTimeout(pollCondition);
                    }
                }, reject);
            };
            pollCondition();
            console.log(message);
        });
    }
    takeScreenshot() {
        const nowSeconds = Math.round(Date.now() / 1000);
        const userAuth = {
            user: 'rokudev',
            pass: this.devPassword,
            sendImmediately: false
        };
        const options = {
            method: 'POST',
            uri: `http://${this.host}/plugin_inspect`,
            auth: userAuth,
            formData: {
                mysubmit: 'Screenshot',
                archive: '',
                passwd: ''
            }
        };

        return request(options)
            .then(resp => {
                const opts = {
                    method: 'GET',
                    uri: `http://${this.host}/pkgs/dev.jpg?time=${nowSeconds}`,
                    auth: userAuth,
                    resolveWithFullResponse: true,
                    encoding: null
                };
                return request(opts);
            })
            .then(res => {
                return res.body;
            });
    }
    dispose() {
        this.client.disconnect();
    }
}

module.exports = {
    Condition,
    SGDriver
};
