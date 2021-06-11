import { once } from "events";
import { mediator } from "../mediator";

import { Game } from "../models/game";

import { Context } from "../context";

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
  await Context.storage.updateUser(user);
  mediator.emit(`game:${game.getId()}:updated`, game);

  return game;
}

async function getGamesList() {
  const games = await Context.storage.getGames();
  return games.map((game) => game.getInfo());
}

async function nextGameState(gameId, userId) {
  return once(mediator, `game:${gameId}:updated`).then(([game]) =>
    game.getGameStateForPlayer(userId)
  );
}

async function getGameById(id) {
  const game = await Context.storage.getGameById(id);
  if (!game) {
    throw new Error("Game doesn't exist");
  }
  game.addObserver(() => {
    mediator.emit(`game:${game?.getId()}:updated`, game);
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
  user.setGame(game.getId());
  await Context.storage.updateGame(game);
  await Context.storage.updateUser(user);
}

async function makeGameTurn(game, user, target) {
  game.makeShot(user.getId(), target);
  return Context.storage.updateGame(game);
}

async function leaveGame(game, user) {
  // TODO: update user active games list
  game.leave(user.getId());
  if (game.getOwnerId() === user.getId()) {
    user.setGame(null);
    await Context.storage.updateUser(user);
    const secondUserId = game.getSecondPlayerId();
    if (secondUserId) {
      const secondUser = await Context.storage.getUserById(
        game.getSecondPlayerId()
      );

      if (secondUser) {
        secondUser.setGame(null);
        await Context.storage.updateUser(secondUser);
      }
    }
  } else {
    user.setGame(null);
    await Context.storage.updateUser(user);
  }
  return Context.storage.updateGame(game);
}

export {
  createNewGame,
  getGameById,
  getGamesList,
  nextGameState,
  startGame,
  joinGame,
  makeGameTurn,
  leaveGame
};
