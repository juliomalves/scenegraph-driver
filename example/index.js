const fs = require('fs');
const { Builder, Key, By, until } = require('../index');
const configJson = require('./driver.config.json');

(async function doStuff() {
    let driver;
    try {
        driver = await new Builder().setConfig(configJson).build();
        await driver.launch();
        await driver.wait(until.documentLoaded(), 5000);
        await driver.wait(until.elementLocated(By.id('categoriesLabelList')), 2000);
        await driver.sendKeys([
            Key.DOWN, 
            Key.DOWN, 
            Key.OK, 
            Key.OK
        ]);
        await driver.wait(until.elementLocated(By.id('exampleVector2DAnimation')), 2000);
        const screenshot = await driver.takeScreenshot();
        const nowSeconds = Math.round(Date.now() / 1000);
        fs.writeFileSync(`screenshots/screenshot_${nowSeconds}.jpg`, screenshot);
        await driver.sendKeys([
            Key.BACK
        ]);
    } catch(err) {
        console.error(err);
    } finally {
        if (driver) {
            await driver.sendKey(Key.HOME, 1000);
            driver.disconnect();
        }
    }
})();
