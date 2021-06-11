export class Observer {
  private observers: ((event: string, payload: unknown) => void)[];

  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(
      (existedObserver) => existedObserver !== observer
    );
  }

  _notify(event, payload) {
    this.observers.forEach((observer) => observer(event, payload));
  }
}
