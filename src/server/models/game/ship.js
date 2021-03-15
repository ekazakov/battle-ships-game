exports.Ship = class Ship {
  constructor(size) {
    this._size = size;
    this._heath = size;
  }

  processShoot() {
    if (this._heath > 0) {
      this._heath--;
    }
  }

  isDestroyed() {
    return this._heath === 0;
  }

  getSize() {
    return this._size;
  }
};
