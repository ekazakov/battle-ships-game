const {
  StateMachine,
  transitionTo,
  getState,
  STATES,
  STARTING_STATE
} = require("../common/state-machine");
const getNextId = require("./id-generator");

const States = {
  IDLE: "idle",

  AWAITING_PLAYER: "awaitingPlayer",
  PLAYER_JOINED: "playerJoined",
  AWAITING_START: "awaitingStart",
  PLAYER_A_TURN: "playerATurn",
  PLAYER_B_TURN: "playerBTurn",
  FINISHED: "finished",
  DESTROYED: "destroyed"
};

function createGame() {
  return StateMachine({
    playerA: null,
    playerB: null,

    currentPlayer: null,
    waitingPlayer: null,

    switchPlayer() {
      console.log(`Pass turn to player: ${this.waiting().getId()}`);

      [this.currentPlayer, this.waitingPlayer] = [
        this.waitingPlayer,
        this.currentPlayer
      ];
    },

    [STARTING_STATE]: States.IDLE,
    [STATES]: {
      [States.IDLE]: {
        initialize: transitionTo(States.AWAITING_PLAYER, function (playerA) {
          this.playerA = playerA;
        })
      },
      [States.AWAITING_PLAYER]: {
        join: transitionTo(States.PLAYER_JOINED, function (playerB) {
          this.playerB = playerB;
        }),
        destroy: transitionTo(States.DESTROYED, function () {})
      },
      [States.PLAYER_JOINED]: {
        leave: transitionTo(States.AWAITING_START, function () {}),
        destroy: transitionTo(States.DESTROYED, function () {})
      },
      [States.AWAITING_START]: {
        start: transitionTo(States.PLAYER_A_TURN, function () {
          this.currentPlayer = this.playerA;
          this.waitingPlayer = this.playerB;
        }),
        destroy: transitionTo(States.DESTROYED, function () {})
      },

      [States.PLAYER_A_TURN]: {
        makeShot: transitionTo(States.PLAYER_B_TURN, function (player) {
          if (player !== this.playerA) {
            throw new Error("Player can't act durign other player turn");
          }

          this.switchPlayer();
        }),
        finish: transitionTo(States.FINISHED, function () {}),
        destroy: transitionTo(States.DESTROYED, function () {})
      },
      [States.PLAYER_B_TURN]: {
        makeShot: transitionTo(States.PLAYER_A_TURN, function (player) {
          if (player !== this.playerB) {
            throw new Error("Player can't act durign other player turn");
          }

          this.switchPlayer();
        }),
        finish: transitionTo(States.FINISHED, function () {}),
        destroy: transitionTo(States.DESTROYED, function () {})
      },
      [States.FINISHED]: {
        destroy: transitionTo(States.DESTROYED, function () {})
      },
      [States.DESTROYED]: {}
    }
  });
}

exports.Game = class Game {
  constructor(owner) {
    this._id = getNextId("game");
    this._owner = owner;
    this._machine = createGame();
    this._state = getState(this._machine);
  }

  getState() {
    return getState(this._machine);
  }

  initialize() {
    this._machine.initialize(this.owner);
  }

  start() {}

  join(player) {
    this._machine.join(player);
  }

  leave(player) {
    if (player === this._owner) {
      this._machine.destroy();
    } else {
      this._machine.leave();
    }
  }

  makeShot(player, target) {
    this._machine.makeShot(player, target);
    // TODO: check game over
  }

  destroy() {
    this._machine.destroy();
  }

  finish() {}

  getCurrentPlayer() {
    return this._machine.currentPlayer;
  }

  getWaitingPlayer() {
    return this._machine.waitingPlayer;
  }

  getGameState() {
    const current = this.getCurrentPlayer();
    const waiting = this.getWaitingPlayer();
    const winnerId = waiting.isAllShipsDestroyed() ? current.getId() : null;

    return {
      winnerId,
      currentPlayer: current.getInfo(),
      waitingPlayer: waiting.getInfo(),
      ownBoard: current.getBoard().getSnapshoot(),
      enemyBoard: waiting.getBoard().getPublicSnapshoot()
    };
  }
};
