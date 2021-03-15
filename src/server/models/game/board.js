const { ShootResult } = require("../../../common/constants");
const {
  BOARD_SIZE,
  Direction,
  ShipType
} = require("../../../common/constants");
const { Cell } = require("./cell");
const { Ship } = require("./ship");

const layout = [
  {
    direction: Direction.HORIZONTAL,
    x: 6,
    y: 0
  },
  {
    direction: Direction.VERTICAL,
    x: 3,
    y: 0
  },
  {
    direction: Direction.VERTICAL,
    x: 1,
    y: 4
  },
  {
    direction: Direction.HORIZONTAL,
    x: 0,
    y: 0
  },
  {
    direction: Direction.VERTICAL,
    x: 9,
    y: 2
  },
  {
    direction: Direction.VERTICAL,
    x: 8,
    y: 8
  },
  {
    direction: Direction.VERTICAL,
    x: 6,
    y: 5
  },
  {
    direction: Direction.VERTICAL,
    x: 3,
    y: 8
  },
  {
    direction: Direction.VERTICAL,
    x: 5,
    y: 8
  },
  {
    direction: Direction.VERTICAL,
    x: 0,
    y: 9
  }
];

function createCells(size) {
  const cells = new Array(size);

  for (let i = 0; i < size; i++) {
    cells[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      cells[i][j] = new Cell({ x: j, y: i });
    }
  }

  return cells;
}

function createShips() {
  return [
    new Ship(ShipType.BATTLE_SHIP),
    new Ship(ShipType.DESTROYER),
    new Ship(ShipType.DESTROYER),
    new Ship(ShipType.FRIGATE),
    new Ship(ShipType.FRIGATE),
    new Ship(ShipType.FRIGATE),
    new Ship(ShipType.BOAT),
    new Ship(ShipType.BOAT),
    new Ship(ShipType.BOAT),
    new Ship(ShipType.BOAT)
  ];
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line no-unused-vars
function getRandomPosition(size) {
  return {
    x: getRandomInteger(0, size),
    y: getRandomInteger(0, size)
  };
}

// eslint-disable-next-line no-unused-vars
function getRandomDirection() {
  if (getRandomInteger(0, 1) === 0) {
    return Direction.VERTICAL;
  }

  return Direction.HORIZONTAL;
}

// function testPostion(position, direction, ship, cells) {}

exports.Board = class Board {
  constructor({ size } = { size: BOARD_SIZE }) {
    this._size = size;
    this._cells = createCells(size);
    this._ships = createShips();
    this._placeShips();
  }

  _placeShips() {
    this._ships.forEach((ship, index) => {
      const { x, y, direction } = layout[index];
      const position = { x, y };
      // ship.setPosition(position, direction);
      this._markOccupiedCells(position, direction, ship);
    });
  }

  _markOccupiedCells(position, direction, ship) {
    let { x, y } = position;
    for (let i = 0; i < ship.getSize(); i++) {
      this._cells[y][x].addShip(ship);
      if (direction === Direction.HORIZONTAL) {
        x++;
      } else {
        y++;
      }
    }
  }

  isAllShipsDestroyed() {
    return this._ships.every((ship) => ship.isDestroyed());
  }

  getSnapshoot() {
    const snapshoot = new Array(this._size);
    for (let i = 0; i < this._size; i++) {
      const row = new Array(this._size);
      for (let j = 0; j < this._size; j++) {
        const cell = this._cells[i][j];
        if (cell.getShip() && cell.isHit()) {
          row[j] = "x";
        } else if (cell.getShip()) {
          row[j] = "+";
        } else if (cell.isHit()) {
          row[j] = "o";
        } else {
          row[j] = "";
        }
      }
      snapshoot[i] = row;
    }

    return snapshoot;
  }

  getPublicSnapshoot() {
    const snapshoot = new Array(this._size);
    for (let i = 0; i < this._size; i++) {
      const row = new Array(this._size);
      for (let j = 0; j < this._size; j++) {
        const cell = this._cells[i][j];
        if (cell.getShip() && cell.isHit()) {
          row[j] = "x";
        } else if (cell.getShip()) {
          row[j] = "";
        } else if (cell.isHit()) {
          row[j] = "o";
        } else {
          row[j] = "";
        }
      }
      snapshoot[i] = row;
    }

    return snapshoot;
  }

  _getCell(position) {
    return this._cells[position.y][position.x];
  }

  processShoot(position) {
    if (this.isHit(position)) {
      return ShootResult.REPEAT;
    }
    this._getCell(position).processShoot();

    if (this.isEmptyCell(position)) {
      return ShootResult.MISS;
    }

    if (this.isShipDestroyed(position)) {
      return ShootResult.KILL;
    }

    return ShootResult.HIT;
  }

  isHit(position) {
    return this._getCell(position).isHit();
  }

  isEmptyCell(position) {
    return this._getCell(position).isEmpty();
  }

  isShipDestroyed(position) {
    const cell = this._getCell(position);
    const ship = cell.getShip();

    return ship != null && ship.isDestroyed();
  }
};
