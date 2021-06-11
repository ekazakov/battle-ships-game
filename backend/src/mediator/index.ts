import { EventEmitter } from "events";
class Mediator extends EventEmitter {}

export const mediator = new Mediator();
