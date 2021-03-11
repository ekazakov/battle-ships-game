exports.Ship = class Ship {
  constructor({ size }) {
    this._size = size;
    this._heath = size;
    this._position = null;
    this._direction = null;
  }

  processShoot() {
    if (this._heath > 0) {
      this._heath--;
    }
  }

  isDestroyed() {
    return this._heath === 0;
  }

  setPosition(position, direction) {
    this._position = position;
    this._direction = direction;
  }

  getSize() {
    return this._size;
  }
};
