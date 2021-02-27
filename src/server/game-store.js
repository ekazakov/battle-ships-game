const { Game } = require("../common/game");
const { getUserById } = require("./user-store");

const games = new Map();

function createNewGame(userId) {
  const user = getUserById(userId);
  const game = new Game(user);
  games.set(game.getId(), game);

  if (user.getGameId() != null) {
    throw new Error("User already has associated game");
  }

  user.setGame(game.getId());
  return game;
}

function getGameById(id) {
  return games.get(id);
}

function getGameByUserId() {}

function getGamesList() {
  return [...games.values()].map((game) => {
    return {
      id: game.getId(),
      owner: game.getOwnerInfo(),
      state: game.getState()
    };
  });
}

function resetGamesStore() {
  games.clear();
}

module.exports = {
  createNewGame,
  getGameById,
  getGameByUserId,
  resetGamesStore,
  getGamesList
};
