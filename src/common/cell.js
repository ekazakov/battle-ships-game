exports.Cell = class Cell {
  constructor(position) {
    this._ship = null;
    this._isHit = false;
    this._position = position;
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
      const { x, y } = this._position;
      console.log("cell > process shoot:", `(${x}, ${y})`);
      this._isHit = true;
      if (!this.isEmpty()) {
        this._ship.processShoot();
      }
    } else {
      console.log("cell > process shoot: already hit");
    }
  }
};
