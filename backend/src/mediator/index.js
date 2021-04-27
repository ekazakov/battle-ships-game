const EventEmitter = require("events");
class Mediator extends EventEmitter {}
exports.mediator = new Mediator();
