const { Game } = require("../models/game");
const { Context } = require("../context");

async function createNewGame(userId) {
  const user = await Context.storage.getUserById(userId);
  if (!user) {
    throw new Error(`User with id: '${userId}' doesn't exists`);
  }
  if (user.getGameId() != null) {
    throw new Error("User already has associated game");
  }

  const game = Game.createGame(user.getId());
  user.setGame(game.getId());
  await Context.storage.addGame(game);

  return game;
}

async function getGamesList() {
  const games = await Context.storage.getGames();
  return games.map((game) => game.getInfo());
}

async function nextGameState(game) {
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

async function getGameById(id) {
  return await Context.storage.getGameById(id);
}

module.exports = {
  createNewGame,
  getGameById,
  getGamesList,
  nextGameState
};
