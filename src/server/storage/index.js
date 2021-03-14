const low = require("lowdb");
const lodashId = require("lodash-id");
const FileAsync = require("lowdb/adapters/FileAsync");
const Base = require("lowdb/adapters/Base");
const { User } = require("../models/user");

class MemoryAsync extends Base {
  _data = null;

  read() {
    return Promise.resolve(this._data || this.defaultValue);
  }
  write(data) {
    this._data = data;
    return Promise.resolve(data);
  }
}
// const games = new Map();
// const usersByName = new Map();
// const usersById = new Map();

async function initDb(adapter, defaultData) {
  const db = await low(adapter);
  db._.mixin(lodashId);
  await db.defaults(defaultData).write();
  return db;
}

exports.Storage = class Storage {
  static async createMemoryStore(defaultData = { users: [], games: [] }) {
    const adapter = new MemoryAsync();
    const db = await initDb(adapter, defaultData);
    return new Storage(db);
  }

  static async createFileStore(defaultData = { users: [], games: [] }) {
    const adapter = new FileAsync("database.json");
    const db = await initDb(adapter, defaultData);
    return new Storage(db);
  }

  constructor(db) {
    if (!db) {
      throw new Error("Database instance should be provided");
    }

    this._db = db;
  }

  async _isUserWithNameExists(name) {
    return (await this._db.get("users").find({ name }).value()) != null;
  }

  async _isUserWithIdExists(id) {
    const u = await this._db.get("users").value();
    console.log(">> id", id);
    console.log(">> users", u);
    return (await this._db.get("users").find({ id }).value()) != null;
  }

  async getUserById(id) {
    const data = await this._db.get("users").find({ id }).value();
    return User.deserialize(data);
  }

  async getUserByName(name) {
    const data = await this._db.get("users").find({ name }).value();
    return User.deserialize(data);
  }

  async addUser(user) {
    const name = user.getName();
    const id = user.getId();

    if (await this._isUserWithIdExists(id)) {
      throw new Error(`User with id '${id}' already exists`);
    }

    if (await this._isUserWithNameExists(name)) {
      throw new Error(`User with name '${name}' already exists`);
    }

    const userData = await this._db
      .get("users")
      .push(User.serialize(user))
      .last()
      .write();
    console.log("Finish write");
    return User.deserialize(userData);
  }

  async getUsers() {
    return await this._db.get("users").map(User.deserialize).value();
  }

  async addGame(game) {
    if (this._games.has(game.getId())) {
      throw new Error(`Game with id: '${game.getId()}' already exists`);
    }

    this._games.set(game.getId(), game);
    return game;
  }

  async getGameById(id) {
    return this._games.get(id);
  }

  async getGames() {
    return [...this._games.values()];
  }

  async resetStorage() {
    this._games.clear();
    this._usersByName.clear();
    this._usersById.clear();
  }
};
