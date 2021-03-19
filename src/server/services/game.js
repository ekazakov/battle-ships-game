const events = require("events");
const { mediator } = require("../mediator");
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

  game.addObserver((evt, payload) => {
    mediator.emit(`game:${game.getId()}:updated`, payload);
  });

  return game;
}

async function getGamesList() {
  const games = await Context.storage.getGames();
  return games.map((game) => game.getInfo());
}

async function nextGameState(gameId) {
  return events.once(mediator, `game:${gameId}:updated`).then(([data]) => data);
}

async function getGameById(id) {
  const game = await Context.storage.getGameById(id);
  game?.addObserver((evt, payload) => {
    mediator.emit(`game:${game?.getId()}:updated`, payload);
  });
  return game;
}

// TODO: null check
async function startGame(game) {
  game.start();
  return Context.storage.updateGame(game);
}

async function joinGame(game, user) {
  game.join(user.getId());
  return Context.storage.updateGame(game);
}

async function makeGameTurn(game, user, target) {
  game.makeShot(user.getId(), target);
  return Context.storage.updateGame(game);
}

async function leaveGame(game, user) {
  // TODO: update user active games list
  game.leave(user.getId());
  return Context.storage.updateGame(game);
}

module.exports = {
  createNewGame,
  getGameById,
  getGamesList,
  nextGameState,
  startGame,
  joinGame,
  makeGameTurn,
  leaveGame
};
