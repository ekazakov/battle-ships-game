const { resetIds } = require("../../../utils/id-generator");
const { Direction } = require("../../../../common/constants");
const { Game, States } = require("../index");

function createPlayer(id) {
  return {
    getId() {
      return `player_${id}`;
    },

    getInfo() {
      return { name: `Player ${id}`, id: this.getId() };
    }
  };
}

describe("Game", function () {
  beforeEach(async () => resetIds());

  describe("getId", () => {
    let game = null;
    beforeEach(async () => {
      game = new Game({});
    });

    it("should return game id", () => {
      expect(game.getId()).toEqual(expect.any(String));
    });
  });

  describe("State transitions", () => {
    let game = null;
    let playerA = null;
    let playerB = null;
    beforeEach(async () => {
      playerA = createPlayer(1);
      playerB = createPlayer(2);
      game = new Game(playerA);
    });

    afterEach(() => {
      game = null;
      playerA = null;
      playerB = null;
    });
    //TODO: add test for game.addObserver

    it("should be in AWAITING_PLAYER after creation", () => {
      expect.hasAssertions();

      expect(game.getState()).toBe(States.AWAITING_PLAYER);
    });

    it("should be in AWAITING_START after second player joined", () => {
      expect.hasAssertions();

      game.join(playerB);
      expect(game.getState()).toBe(States.AWAITING_START);
    });

    it("should transition to DESTROYED state", () => {
      expect.hasAssertions();

      game.join(playerB);
      game.destroy();

      expect(game.getGameState()).toMatchObject({
        state: States.DESTROYED,
        winnerId: null,
        current: null,
        waiting: null
      });
    });

    describe("AWAITING_START", () => {
      it("should be in PLAYER_A_TURN after start", () => {
        expect.hasAssertions();

        game.join(playerB);
        game.start();
        expect(game.getState()).toBe(States.PLAYER_TURN);
      });

      it("should be in AWAITING_PLAYER after second player leave", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.leave(playerB);
        expect(game.getState()).toBe(States.AWAITING_PLAYER);
      });

      it("should be in DESTROYED after owner player leave", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.leave(playerA);
        expect(game.getState()).toBe(States.DESTROYED);
      });
    });

    describe("MAKE_TURN", () => {
      it("should hit other player ship and continue current player turn", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 6, y: 0 });
        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 1", id: "player_1" },
          waiting: { name: "Player 2", id: "player_2" }
        });
      });

      it("should switch player on miss", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 5, y: 0 });
        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 2", id: "player_2" },
          waiting: { name: "Player 1", id: "player_1" }
        });
      });

      it("should throw error if waiting player attempts make turn", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 5, y: 0 });
        expect(() => game.makeShot(playerA, { x: 6, y: 0 })).toThrow();
      });

      it("should keep player turn on shooting at the hit cell", () => {
        expect.hasAssertions();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 6, y: 0 });
        game.makeShot(playerA, { x: 6, y: 0 });

        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 1", id: "player_1" },
          waiting: { name: "Player 2", id: "player_2" }
        });
      });

      it("should finish game when the player destroyed all ships of other player", () => {
        const targets = [
          {
            direction: Direction.HORIZONTAL,
            x: 6,
            y: 0,
            size: 4
          },
          {
            direction: Direction.VERTICAL,
            x: 3,
            y: 0,
            size: 3
          },
          {
            direction: Direction.VERTICAL,
            x: 1,
            y: 4,
            size: 3
          },
          {
            direction: Direction.HORIZONTAL,
            x: 0,
            y: 0,
            size: 2
          },
          {
            direction: Direction.VERTICAL,
            x: 9,
            y: 2,
            size: 2
          },
          {
            direction: Direction.VERTICAL,
            x: 8,
            y: 8,
            size: 2
          },
          {
            direction: Direction.VERTICAL,
            x: 6,
            y: 5,
            size: 1
          },
          {
            direction: Direction.VERTICAL,
            x: 3,
            y: 8,
            size: 1
          },
          {
            direction: Direction.VERTICAL,
            x: 5,
            y: 8,
            size: 1
          },
          {
            direction: Direction.VERTICAL,
            x: 0,
            y: 9,
            size: 1
          }
        ];

        expect.hasAssertions();
        game.join(playerB);
        game.start();

        targets.forEach((target) => {
          const { size, direction, x, y } = target;
          for (let i = 0; i < size; i++) {
            const position = {
              x: direction === Direction.HORIZONTAL ? x + i : x,
              y: direction === Direction.VERTICAL ? y + i : y
            };
            game.makeShot(playerA, position);
          }
        });

        expect(game.getGameState()).toMatchSnapshot({
          state: States.FINISHED,
          winnerId: playerA.getId(),
          current: { name: "Player 1", id: "player_1" },
          waiting: { name: "Player 2", id: "player_2" }
        });
      });
    });
  });
});
