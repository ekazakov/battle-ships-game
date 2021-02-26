const usersByName = new Map();
const usersById = new Map();

function isUserWithNameExists(name) {
  return usersByName.has(name);
}

function isUserWithIdExists(id) {
  return usersById.has(id);
}

function getUserById(id) {
  return usersById.get(id);
}

function getUserByName(name) {
  return usersByName.get(name);
}

function registerUser(user) {
  const name = user.getName();
  const id = user.getId();

  if (isUserWithNameExists(name) || isUserWithIdExists(id)) {
    throw new Error(`User with name '${name}' already exists`);
  }

  usersByName.set(name, user);
  usersById.set(id, user);
}

function resetUsers() {
  usersByName.clear();
  usersById.clear();
}

module.exports = {
  isUserWithNameExists,
  isUserWithIdExists,
  getUserById,
  getUserByName,
  registerUser,
  resetUsers
};
