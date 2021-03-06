export class Ship {
  private readonly _size: number;
  private readonly _direction: any;
  private readonly _position: any;
  private _health: number;

  constructor(size, direction, position) {
    this._size = size;
    this._health = size;
    this._direction = direction;
    this._position = position;
  }

  processShoot() {
    if (this._health > 0) {
      this._health--;
    }
  }

  isDestroyed() {
    return this._health === 0;
  }

  getDirection() {
    return this._direction;
  }

  getPosition() {
    return this._position;
  }

  getSize() {
    return this._size;
  }

  isHit() {
    return this._size > this._health;
  }

  getSnapshot() {
    return {
      size: this._size,
      position: this._position,
      direction: this._direction
    };
  }

  static deserialize({ size, direction, position }) {
    return new Ship(size, direction, position);
  }
}
