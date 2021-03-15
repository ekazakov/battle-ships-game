exports.Cell = class Cell {
  constructor(ship, isHit) {
    this._ship = ship;
    this._isHit = isHit || false;
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
};
