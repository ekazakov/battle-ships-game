export class Cell {
  private _ship: any;
  private _isHit: boolean;

  constructor() {
    this._ship = null;
    this._isHit = false;
  }

  addShip(ship) {
    this._ship = ship;
  }

  getShip() {
    return this._ship;
  }

  isEmpty() {
    return this.getShip() === null;
  }

  isHit() {
    return this._isHit;
  }

  processShoot() {
    if (!this._isHit) {
      this._isHit = true;
      if (!this.isEmpty()) {
        this._ship.processShoot();
      }
    }
  }
}
