const { User } = require("../models/user");
const { addUser, getUserById, getUserByName } = require("../storage");

async function isUserWithNameExists(name) {
  return (await getUserByName(name)) != null;
}

async function registerUser({ login, password }) {
  const user = User.createUser(login, password);
  await addUser(user);

  return user;
}

module.exports = {
  isUserWithNameExists,
  getUserById,
  getUserByName,
  registerUser
};
