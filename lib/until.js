const Condition = require('./condition');
const By = require('./by');

function documentLoaded() {
    return new Condition('for document to be loaded', async driver => {
        const root = await driver._getRoot();
        return root.childNodes && root.childNodes.length > 1;
    });
};

function elementLocated(locator) {
    locator = By.format(locator);
    return new Condition(`for element to be located ${locator.toString()}`, async driver => {
        const elements = await driver.findElements(locator);
        return elements && elements.length > 0 ? elements[0] : null;
    });
};

function elementsLocated(locator) {
    locator = By.format(locator);
    return new Condition(`for at least one element to be located ${locator.toString()}`, async driver => {
        const elements = await driver.findElements(locator);
        return elements && elements.length > 0 ? elements : null;
    });
};

module.exports = {
    documentLoaded,
    elementLocated,
    elementsLocated
};