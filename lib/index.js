const SGDriver = require('./sg-driver');
const By = require('./by');
const until = require('./until');
const ZipUtil = require('./utils/zip');
const sgClient = require('./utils/sg-client');

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
};

class Builder {
    constructor() {
    }
    setConfig({ host, sourceFolder, buildPath, devPassword }) {
        this.host = host;
        this.sourceFolder = sourceFolder;
        this.buildPath = buildPath;
        this.devPassword = devPassword;
        return this;
    }
    setHost(host) {
        this.host = host;
        return this;
    }
    getHost() {
        return this.host;
    }
    setSource(source) {
        this.sourceFolder = source;
        return this;
    }
    getSource() {
        return this.sourceFolder;
    }
    setBuildPath(buildPath) {
        this.buildPath = buildPath;
        return this;
    }
    getBuildPath() {
        return this.buildPath;
    }
    setDevPassword(devPassword) {
        this.devPassword = devPassword;
        return this;
    }
    getDevPassword() {
        return this.devPassword;
    }
    async build() {
        if (typeof this.sourceFolder !== 'string') {
            throw new Error(`Source folder must be a string, but is <${typeof this.sourceFolder}>`);
        }
        if (typeof this.buildPath !== 'string') {
            throw new Error(`Build path must be a string, but is <${typeof this.buildPath}>`);
        }
        if (typeof this.host !== 'string') {
            throw new Error(`Host url must be a string, but is <${typeof this.host}>`);
        }
        if (typeof this.devPassword !== 'string') {
            throw new Error(`Developer password must be a string, but is <${typeof this.devPassword}>`);
        }
        const driver = new SGDriver(this.host, sgClient, this.devPassword);
        const zip = new ZipUtil(this.host, this.sourceFolder, this.buildPath, this.devPassword);
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
};
