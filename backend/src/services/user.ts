import { User } from "../models/user";
import { Context } from "../context";

async function isUserWithNameExists(name) {
  return (await Context.storage.getUserByName(name)) != null;
}

async function registerUser({ login, password }) {
  const user = User.createUser(login, password);
  await Context.storage.addUser(user);

  return user;
}

async function getUserById(id) {
  return await Context.storage.getUserById(id);
}
async function getUserByName(name) {
  return await Context.storage.getUserByName(name);
}

export { isUserWithNameExists, getUserById, getUserByName, registerUser };
