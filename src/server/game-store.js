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
  return [...games.values()].map((game) => game.getInfo());
}

function resetGamesStore() {
  games.clear();
}

function nextGameState(game) {
  return new Promise((resolve, reject) => {
    try {
      const observer = (event, payload) => {
        resolve(payload);
        game.removeObserver(observer);
      };
      game.addObserver(observer);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  createNewGame,
  getGameById,
  getGameByUserId,
  resetGamesStore,
  getGamesList,
  nextGameState
};
