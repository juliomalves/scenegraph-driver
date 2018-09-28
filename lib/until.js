const { Condition } = require('./sg-driver');
const { By } = require('./by');

function documentLoaded() {
    return new Condition('for document to be loaded', driver => {
        return driver._getRoot()
            .then(element => element.childNodes && element.childNodes.length > 1);
    });
};

function elementLocated(locator) {
    locator = By.format(locator);
    return new Condition(`for element to be located ${locator.toString()}`, driver => {
        return driver.findElements(locator)
            .then(elements => elements && elements.length > 0 ? elements[0] : null);
    });
};

function elementsLocated(locator) {
    locator = By.format(locator);
    return new Condition(`for at least one element to be located ${locator.toString()}`, driver => {
        return driver.findElements(locator)
            .then(elements => elements && elements.length > 0 ? elements : null);
    });
};

module.exports = {
    documentLoaded,
    elementLocated,
    elementsLocated
};