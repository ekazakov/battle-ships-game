const {
  StateMachine,
  transitionTo,
  getState,
  STATES,
  STARTING_STATE
} = require("../../../common/state-machine");
const { getNextId } = require("../../utils/id-generator");
const { Observer } = require("../../../common/observer");
const { Board } = require("./board");
const { ShootResult } = require("../../../common/constants.js");

const States = {
  IDLE: "idle",
  AWAITING_PLAYER: "awaiting",
  AWAITING_START: "awaitingStart",
  PLAYER_TURN: "playerTurn",
  FINISHED: "finished",
  DESTROYED: "destroyed"
};

exports.States = States;

function createGameMachine(options = {}) {
  const {
    initialState = States.IDLE,
    playerAid = null,
    playerBid = null,
    boards = new Map(),
    current = null,
    waiting = null
  } = options;

  return StateMachine({
    playerAid,
    playerBid,
    boards,
    current,
    waiting,

    switchPlayer() {
      [this.current, this.waiting] = [this.waiting, this.current];
    },

    [STARTING_STATE]: initialState,
    [STATES]: {
      [States.IDLE]: {
        initialize: transitionTo(States.AWAITING_PLAYER, function (playerAid) {
          this.playerAid = playerAid;
          this.boards.set(playerAid, Board.createBoard());
        })
      },
      [States.AWAITING_PLAYER]: {
        join: transitionTo(States.AWAITING_START, function (playerBid) {
          this.playerBid = playerBid;
          this.boards.set(playerBid, Board.createBoard());
        }),
        destroy: transitionTo(States.DESTROYED, function () {}),
        leave: transitionTo(States.DESTROYED, function () {})
      },
      [States.AWAITING_START]: {
        leave: transitionTo(States.AWAITING_PLAYER, function (player) {
          if (player === this.playerAid) {
            this.playerAid = null;
          } else if (player === this.playerBid) {
            this.playerBid = null;
          } else {
            throw Error(`Player with ${player.id} is not in a game`);
          }
        }),
        start: transitionTo(States.PLAYER_TURN, function () {
          this.current = this.playerAid;
          this.waiting = this.playerBid;
        }),
        destroy: transitionTo(States.DESTROYED, function () {})
      },

      [States.PLAYER_TURN]: {
        makeShot: transitionTo(function (player, position) {
          if (player !== this.current) {
            throw new Error("Player can't act during other player turn");
          }

          const board = this.boards.get(this.waiting);
          const result = board.processShoot(position);

          if (board.isAllShipsDestroyed()) {
            return States.FINISHED;
          }

          if (result === ShootResult.MISS) {
            this.switchPlayer();
          }

          return States.PLAYER_TURN;
        }),
        destroy: transitionTo(States.DESTROYED, function () {}),
        leave: transitionTo(States.DESTROYED, function () {})
      },
      [States.FINISHED]: {},
      [States.DESTROYED]: {}
    }
  });
}

exports.Game = class Game extends Observer {
  static createGame(ownerId) {
    return new Game(ownerId, getNextId("game"), createGameMachine());
  }

  constructor(ownerId, id, machine) {
    super();
    this._id = id;
    this._ownerId = ownerId;
    this._secondPlayerId = null;
    this._machine = machine;
    if (this.getState() === States.IDLE) {
      this._machine.initialize(ownerId);
    }
    this._machine.onStateTransition = () => {
      this._notify("update", this.getGameState());
    };
  }

  getId() {
    return this._id;
  }

  getInfo() {
    return {
      id: this.getId(),
      ownerId: this._ownerId,
      state: this.getState()
    };
  }

  getState() {
    return getState(this._machine);
  }

  isOver() {
    return (
      this.getGameState() === States.DESTROYED ||
      this.getGameState() === States.FINISHED
    );
  }

  initialize() {
    this._machine.initialize(this._ownerId);
  }

  start() {
    this._machine.start();
  }

  join(player) {
    const { playerAid, playerBid } = this._machine;
    if (player === playerAid || player === playerBid) {
      return;
    }

    this._secondPlayerId = player;
    this._machine.join(player);
  }

  leave(playerId) {
    if (playerId === this._ownerId) {
      this._machine.destroy();
      this._ownerId = null;
    } else {
      this._machine.leave(playerId);
      if (this.getState() === States.DESTROYED) {
        this._ownerId = null;
      }
    }
  }

  makeShot(player, target) {
    this._machine.makeShot(player, target);
    // TODO: check game over
  }

  destroy() {
    this._machine.destroy();
  }

  getCurrentPlayer() {
    return this._machine.current;
  }

  getWaitingPlayer() {
    return this._machine.waiting;
  }

  getBoard(player) {
    return this._machine.boards.get(player);
  }

  _getSnapshot() {
    const current = this.getCurrentPlayer();
    const waiting = this.getWaitingPlayer();
    const ownerBoard = this.getBoard(this._ownerId);
    const secondPlayerBoard = this.getBoard(this._secondPlayerId);

    return {
      id: this.getId(),
      state: this.getState(),
      current,
      waiting,
      ownerId: this._ownerId,
      secondPlayerId: this._secondPlayerId,
      ownerBoard: ownerBoard?.getSnapshoot() ?? null,
      secondPlayerBoard: secondPlayerBoard?.getPublicSnapshoot() ?? null
    };
  }

  getGameState() {
    const current = this.getCurrentPlayer();
    const waiting = this.getWaitingPlayer();
    const currentBoard = this.getBoard(current);
    const waitingBoard = this.getBoard(waiting);
    const winnerId =
      waitingBoard?.isAllShipsDestroyed() ?? false ? current : null;

    return {
      id: this.getId(),
      state: this.getState(),
      winnerId,
      current,
      waiting,
      ownerId: this._ownerId,
      secondPlayerId: this._secondPlayerId,
      ownBoard: currentBoard?.getSnapshoot() ?? null,
      enemyBoard: waitingBoard?.getPublicSnapshoot() ?? null
    };
  }

  static serialize(game) {
    return game._getSnapshot();
  }

  static deserialize(gameData) {
    const boards = new Map();
    if (gameData.ownerId != null) {
      boards.set(gameData.ownerId, Board.deserialize(gameData.ownerBoard));
    }
    if (gameData.secondPlayerId != null) {
      boards.set(
        gameData.secondPlayerId,
        Board.deserialize(gameData.secondPlayerBoard)
      );
    }

    const machine = createGameMachine({
      initialState: gameData.state,
      playerAid: gameData.ownerId,
      playerBid: gameData.secondPlayerId,
      boards,
      current: gameData.current,
      waiting: gameData.waiting
    });

    return new Game(gameData.ownerId, gameData.id, machine);
  }
};
