const games = new Map();
const usersByName = new Map();
const usersById = new Map();

function isUserWithNameExists(name) {
  return usersByName.has(name);
}

function isUserWithIdExists(id) {
  return usersById.has(id);
}

exports.getUserById = async function getUserById(id) {
  return usersById.get(id);
};

exports.getUserByName = async function getUserByName(name) {
  return usersByName.get(name);
};

exports.addUser = async function addUser(user) {
  const name = user.getName();
  const id = user.getId();

  if (isUserWithNameExists(name) || isUserWithIdExists(id)) {
    throw new Error(`User with name '${name}' already exists`);
  }

  usersByName.set(name, user);
  usersById.set(id, user);
  return user;
};

exports.addGame = async function addGame(game) {
  if (games.has(game.getId())) {
    throw new Error(`User with id: '${game.getId()}' already exists`);
  }

  games.set(game.getId(), game);
};

exports.getGameById = async function getGameById(id) {
  return games.get(id);
};

exports.getGames = async function getGames() {
  return [...games.values()];
};

exports.resetStorage = function resetStorage() {
  games.clear();
  usersByName.clear();
  usersById.clear();
};
