const { ShootResult } = require("../../../common/constants");
const {
  BOARD_SIZE,
  Direction,
  ShipType
} = require("../../../common/constants");
const { Cell } = require("./cell");
const { Ship } = require("./ship");

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

const defaultShips = [
  new Ship(ShipType.BATTLE_SHIP, Direction.HORIZONTAL, { x: 6, y: 0 }),
  new Ship(ShipType.DESTROYER, Direction.VERTICAL, { x: 3, y: 0 }),
  new Ship(ShipType.DESTROYER, Direction.HORIZONTAL, { x: 1, y: 4 }),
  new Ship(ShipType.FRIGATE, Direction.VERTICAL, { x: 0, y: 0 }),
  new Ship(ShipType.FRIGATE, Direction.VERTICAL, { x: 9, y: 2 }),
  new Ship(ShipType.FRIGATE, Direction.VERTICAL, { x: 8, y: 8 }),
  new Ship(ShipType.BOAT, Direction.VERTICAL, { x: 6, y: 5 }),
  new Ship(ShipType.BOAT, Direction.VERTICAL, { x: 3, y: 8 }),
  new Ship(ShipType.BOAT, Direction.VERTICAL, { x: 5, y: 8 }),
  new Ship(ShipType.BOAT, Direction.VERTICAL, { x: 0, y: 9 })
];

exports.Board = class Board {
  static createBoard(ships = defaultShips) {
    const board = new Board(BOARD_SIZE);
    ships.forEach((ship) => board.addShip(ship));
    return board;
  }

  constructor(size) {
    this._size = size;
    this._cells = createCells(size);
    this._ships = [];
  }

  addShip(ship) {
    this._ships.push(ship);
    this._markOccupiedCells(ship);
  }

  _markOccupiedCells(ship) {
    let { x, y } = ship.getPosition();
    for (let i = 0; i < ship.getSize(); i++) {
      this._cells[y][x].addShip(ship);
      if (ship.getDirection() === Direction.HORIZONTAL) {
        x++;
      } else {
        y++;
      }
    }
  }

  isAllShipsDestroyed() {
    return this._ships.every((ship) => ship.isDestroyed());
  }

  getSnapshot() {
    const cellsSnapshot = new Array(this._size);
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
      cellsSnapshot[i] = row;
    }

    const shipsSnapshot = this._ships.map((ship) => ship.getSnapshot());

    return { cells: cellsSnapshot, ships: shipsSnapshot };
  }

  getPublicSnapshot() {
    const cellsSnapshot = new Array(this._size);
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
      cellsSnapshot[i] = row;
    }

    return cellsSnapshot;
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

  static deserialize(data) {
    const board = new Board(BOARD_SIZE);
    data.ships?.forEach((snapshot) =>
      board.addShip(Ship.deserialize(snapshot))
    );
    data.cells?.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === "x" || cell === "o") {
          board.processShoot({ x: colIndex, y: rowIndex });
        }
      });
    });

    return board;
  }
};
