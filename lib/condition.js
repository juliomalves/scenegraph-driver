class Condition {
    constructor(message, fn) {
        this.description = `Waiting ${message}`;
        this.fn = fn;
    }
}

module.exports = Condition;
