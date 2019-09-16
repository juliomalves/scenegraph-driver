const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const By = require('../../lib/by');
const until = require('../../lib/until');

const assert = chai.assert;

describe('index', () => {

    let sut;
    let sgDriverConnectSpy;
    let sgDriverSendKeySpy;
    let zipUtilArchiveSpy;
    let zipUtilUploadSpy;

    class SGDriverClass {
        constructor() {
            sgDriverConnectSpy = sinon.spy(this, 'connect');
            sgDriverSendKeySpy = sinon.spy(this, 'sendKey');
        }
        connect() {}
        sendKey() {}
    }

    class ZipUtilClass {
        constructor() {
            zipUtilArchiveSpy = sinon.spy(this, 'archive');
            zipUtilUploadSpy = sinon.spy(this, 'upload');
        }
        archive() {}
        upload() {}
    }

    beforeEach(() => {
        sut = proxyquire('../../lib/index', {
            './sg-driver': SGDriverClass,
            './utils/zip': ZipUtilClass
        });
    });

    describe('Builder', () => {

        let builder;

        const config = {
            sourceFolder: "app",
            buildPath: "build/app.zip",
            host: "192.168.1.2",
            devPassword: "password"
        };

        beforeEach(() => {
            builder = new sut.Builder();
        });

        afterEach(() => {
            builder = undefined;
        });

        it('should set config', async () => {
            await builder.setConfig(config);
            assert.equal(builder.host, config.host);
            assert.equal(builder.sourceFolder, config.sourceFolder);
            assert.equal(builder.buildPath, config.buildPath);
            assert.equal(builder.devPassword, config.devPassword);
        });

        it('should set host', async () => {
            await builder.setHost(config.host);
            assert.equal(builder.host, config.host);
        });

        it('should get host', async () => {
            await builder.setHost(config.host);
            assert.equal(builder.getHost(), config.host);
        });

        it('should set sourceFolder', async () => {
            await builder.setSource(config.sourceFolder);
            assert.equal(builder.sourceFolder, config.sourceFolder);
        });

        it('should get sourceFolder', async () => {
            await builder.setSource(config.sourceFolder);
            assert.equal(builder.getSource(), config.sourceFolder);
        });

        it('should set buildPath', async () => {
            await builder.setBuildPath(config.buildPath);
            assert.equal(builder.buildPath, config.buildPath);
        });

        it('should get buildPath', async () => {
            await builder.setBuildPath(config.buildPath);
            assert.equal(builder.getBuildPath(), config.buildPath);
        });

        it('should set devPassword', async () => {
            await builder.setDevPassword(config.devPassword);
            assert.equal(builder.devPassword, config.devPassword);
        });

        it('should get devPassword', async () => {
            await builder.setDevPassword(config.devPassword);
            assert.equal(builder.getDevPassword(), config.devPassword);
        });

        describe('build', () => {

            let driver;

            beforeEach(() => {
                builder.setConfig(config);
            });

            afterEach(() => {
                driver = undefined;
            });

            it('should build driver', async () => {
                driver = await builder.build();
                assert.ok(sgDriverConnectSpy.calledOnce);
                assert.ok(sgDriverSendKeySpy.withArgs('Home', 1000).calledOnce);
                assert.ok(zipUtilArchiveSpy.calledOnce);
                assert.ok(zipUtilUploadSpy.calledOnce);
                assert.instanceOf(driver, SGDriverClass);
            });

            it('should throw error if sourceFolder is undefined', async () => {
                const value = undefined;
                try {
                    driver = await builder.setSource(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Source folder must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if sourceFolder is not a string', async () => {
                const value = 12345;
                try {
                    driver = await builder.setSource(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Source folder must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if buildPath is undefined', async () => {
                const value = undefined;
                try {
                    driver = await builder.setBuildPath(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Build path must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if buildPath is not a string', async () => {
                const value = 12345;
                try {
                    driver = await builder.setBuildPath(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Build path must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if host is undefined', async () => {
                const value = undefined;
                try {
                    driver = await builder.setHost(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Host url must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if host is not a string', async () => {
                const value = 12345;
                try {
                    driver = await builder.setHost(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Host url must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if devPassword is undefined', async () => {
                const value = undefined;
                try {
                    driver = await builder.setDevPassword(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Developer password must be a string, but is <${typeof value}>`);
                }
            });

            it('should throw error if devPassword is not a string', async () => {
                const value = 12345;
                try {
                    driver = await builder.setDevPassword(value).build();
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.message, `Developer password must be a string, but is <${typeof value}>`);
                }
            });

        });

    });

    describe('Key', () => {

        const keys = {
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

        it('should export keys', () => {
            assert.deepEqual(sut.Key, keys);
        });

    });

    describe('By', () => {

        it('should export By class', () => {
            assert.equal(sut.By, By);
        });

    });

    describe('until', () => {

        it('should export until methods', () => {
            assert.equal(sut.until, until);
        });

    });

});
