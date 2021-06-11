import {
  getState,
  STARTING_STATE,
  StateMachine,
  STATES,
  transitionTo
} from "../../utils/state-machine";

import { ShootResult } from "../../utils/constants";
import { Board } from "./board";
// import { Observer } from "../../utils/observer";
import { getNextId } from "../../utils/id-generator";
import { Observer } from "../../utils/observer";

const States = {
  IDLE: "idle",
  AWAITING_PLAYER: "awaiting",
  AWAITING_START: "awaitingStart",
  PLAYER_TURN: "playerTurn",
  FINISHED: "finished",
  DESTROYED: "destroyed"
};

export { States };

interface GameMachineOptions {
  initialState: string;
  playerAid: string | null;
  playerBid: string | null;
  boards: Map<string, Board>;
  current: string | null;
  waiting: string | null;
}

const defaultOptions = {
  initialState: States.IDLE,
  playerAid: null,
  playerBid: null,
  boards: new Map(),
  current: null,
  waiting: null
};
function createGameMachine(options: GameMachineOptions = defaultOptions) {
  const { initialState, playerAid, playerBid, boards, current, waiting } =
    options;

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
        leave: transitionTo(function (playerId) {
          if (playerId === this.playerAid) {
            return States.DESTROYED;
          } else if (playerId === this.playerBid) {
            this.playerBid = null;
            return States.AWAITING_PLAYER;
          } else {
            throw Error(`Player with ${playerId.id} is not in a game`);
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

export class Game extends Observer {
  private readonly _id: any;
  private readonly _ownerId: any;
  private readonly _machine: any;
  static createGame(ownerId) {
    return new Game(ownerId, getNextId("game"), createGameMachine());
  }

  constructor(ownerId, id, machine) {
    super();
    this._id = id;
    this._ownerId = ownerId;
    this._machine = machine;
    if (this.getState() === States.IDLE) {
      this._machine.initialize(ownerId);
    }
    this._machine.onStateTransition = () => {
      this._notify("update", {});
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

  getOwnerId() {
    return this._ownerId;
  }

  getSecondPlayerId() {
    return this._machine.playerBid;
  }

  getState() {
    return getState(this._machine);
  }

  isOver() {
    return (
      this.getState() === States.DESTROYED ||
      this.getState() === States.FINISHED
    );
  }

  initialize() {
    this._machine.initialize(this._ownerId);
  }

  start() {
    this._machine.start();
  }

  join(playerId) {
    const { playerAid, playerBid } = this._machine;
    if (playerId === playerAid || playerId === playerBid) {
      return;
    }

    this._machine.join(playerId);
  }

  leave(playerId) {
    this._machine.leave(playerId);
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

  private _getSnapshot() {
    const current = this.getCurrentPlayer();
    const waiting = this.getWaitingPlayer();
    const ownerBoard = this.getBoard(this._ownerId);
    const secondPlayerId = this._machine.playerBid;
    const secondPlayerBoard = this.getBoard(secondPlayerId);

    return {
      id: this.getId(),
      state: this.getState(),
      current,
      waiting,
      ownerId: this._ownerId,
      secondPlayerId,
      ownerBoard: ownerBoard?.getSnapshot() ?? null,
      secondPlayerBoard: secondPlayerBoard?.getSnapshot() ?? null
    };
  }

  getFullGameState() {
    return this._getSnapshot();
  }

  getGameStateForPlayer(playerId) {
    const ownerId = this._ownerId;
    const secondPlayerId = this._machine.playerBid;
    const current = this.getCurrentPlayer();
    const waiting = this.getWaitingPlayer();
    const ownerBoard = this.getBoard(ownerId);
    const secondPlayerBoard = this.getBoard(secondPlayerId);

    const ownBoard = ownerId === playerId ? ownerBoard : secondPlayerBoard;
    const enemyBoard = ownerId === playerId ? secondPlayerBoard : ownerBoard;

    const isAllOwnerShipsDestroyed = ownerBoard?.isAllShipsDestroyed() || false;
    const isAllSecondPlayerShipsDestroyed =
      secondPlayerBoard?.isAllShipsDestroyed() || false;
    const winnerId = isAllOwnerShipsDestroyed
      ? secondPlayerId
      : isAllSecondPlayerShipsDestroyed
      ? ownerId
      : null;

    return {
      id: this.getId(),
      state: this.getState(),
      winnerId,
      current,
      waiting,
      ownerId,
      ownId: playerId,
      enemyId: ownerId === playerId ? secondPlayerId : ownerId,
      ownBoard: ownBoard?.getSnapshot(),
      enemyBoard: enemyBoard?.getPublicSnapshot() || null
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
}
