const { Game } = require("../models/game");
const { addGame, getGameById, getGames, getUserById } = require("../storage");

async function createNewGame(userId) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error(`User with id: '${userId}' doesn't exists`);
  }
  if (user.getGameId() != null) {
    throw new Error("User already has associated game");
  }

  const game = new Game(user);
  user.setGame(game.getId());
  await addGame(game);

  return game;
}

async function getGamesList() {
  const games = await getGames();
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

module.exports = {
  createNewGame,
  getGameById,
  getGamesList,
  nextGameState
};
