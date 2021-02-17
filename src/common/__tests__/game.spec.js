const { Game, States } = require("../game");

describe("Game", function () {
  describe("Game id", () => {
    let game = null;
    beforeEach(() => {
      game = new Game({});
    });

    it("should have id", () => {
      expect(game.getId()).toEqual(expect.any(Number));
    });
  });

  describe("State", () => {
    let game = null;
    beforeEach(() => {
      game = new Game({});
    });

    it("new game in IDLE state", () => {
      expect(game.getState()).toBe(States.IDLE);
    });
  });

  describe("", function () {
    it.skip("game", () => {});
    it("game 2", () => {});
  });
});
