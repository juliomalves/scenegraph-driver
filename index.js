const SGDriver = require('./lib/sg-driver');
const By = require('./lib/by');
const until = require('./lib/until');
const ZipUtil = require('./lib/utils/zip');
const sgClient = require('./lib/utils/sg-client');

const Key = {
    HOME: 'Home',
    RWD: 'Rev',
    FWD: 'Fwd',
    PLAY: 'Play',
    OK: 'Select',
    LEFT: 'Left',
    RIGHT: 'Right',
    DOWN: 'Down',
    UP: 'Up',
    BACK: 'Back',
    REPLAY: 'InstantReplay',
    INFO: 'Info',
    BACKSPACE: 'Backspace',
    SEARCH: 'Search',
    ENTER: 'Enter',
    A: 'Lit_a',
    B: 'Lit_b',
    C: 'Lit_c',
    D: 'Lit_d',
    E: 'Lit_e',
    F: 'Lit_f',
    G: 'Lit_g',
    H: 'Lit_h',
    I: 'Lit_i',
    J: 'Lit_j',
    K: 'Lit_k',
    L: 'Lit_l',
    M: 'Lit_m',
    N: 'Lit_n',
    O: 'Lit_o',
    P: 'Lit_p',
    Q: 'Lit_q',
    R: 'Lit_r',
    S: 'Lit_s',
    T: 'Lit_t',
    U: 'Lit_u',
    V: 'Lit_v',
    W: 'Lit_w',
    X: 'Lit_x',
    Y: 'Lit_y',
    Z: 'Lit_z'
}

class Builder {
    constructor() {
        this.config = {};
    }
    setConfig(config) {
        this.config = config;
        return this;
    }
    setHost(host) {
        this.config.host = host;
        return this;
    }
    getHost() {
        return this.config.host;
    }
    setSource(source) {
        this.config.sourceFolder = source;
        return this;
    }
    getSource() {
        return this.config.sourceFolder;
    }
    setBuildPath(buildPath) {
        this.config.buildPath = buildPath;
        return this;
    }
    getBuildPath() {
        return this.config.buildPath;
    }
    setDevPassword(devPassword) {
        this.config.devPassword = devPassword;
        return this;
    }
    getDevPassword() {
        return this.config.devPassword;
    }
    async build() {
        const config = this.config;
        if (typeof config.sourceFolder !== 'string') {
            throw new Error(`Source folder must be a string, but is <${typeof config.sourceFolder}>`);
        }
        if (typeof config.buildPath !== 'string') {
            throw new Error(`Build path must be a string, but is <${typeof config.buildPath}>`);
        }
        if (typeof config.host !== 'string') {
            throw new Error(`Host url must be a string, but is <${typeof config.host}>`);
        }
        if (typeof config.devPassword !== 'string') {
            throw new Error(`Developer password must be a string, but is <${typeof config.devPassword}>`);
        }
        const driver = new SGDriver(config.host, sgClient, config.devPassword);
        const zip = new ZipUtil(config);  
        await driver.connect();
        await driver.sendKey(Key.HOME, 1000);
        await zip.archive();
        await zip.upload();
        return driver;
    }
}

module.exports = {
    Builder,
    Key,
    By,
    until
}
