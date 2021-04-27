const { Mutex } = require("async-mutex");
const low = require("lowdb");
const lodashId = require("lodash-id");
const FileAsync = require("lowdb/adapters/FileAsync");
const Base = require("lowdb/adapters/Base");
const { User } = require("../models/user");
const { Game } = require("../models/game");

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

  static async resetMemoryStore(
    storage,
    defaultData = { users: [], games: [] }
  ) {
    const adapter = new MemoryAsync();
    storage._db = await initDb(adapter, defaultData);
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
    this._dbMutex = new Mutex();
  }

  async _isUserWithNameExists(name) {
    return (await this._db.get("users").find({ name }).value()) != null;
  }

  async _isUserWithIdExists(id) {
    return (await this._db.get("users").find({ id }).value()) != null;
  }

  async getUserById(id) {
    const data = await this._db.get("users").find({ id }).value();
    return data != null ? User.deserialize(data) : null;
  }

  async getUserByName(name) {
    const data = await this._db.get("users").find({ name }).value();
    return data != null ? User.deserialize(data) : null;
  }

  async addUser(user) {
    try {
      return await this._dbMutex.runExclusive(async () => {
        const name = user.getName();
        const id = user.getId();

        if (await this._isUserWithIdExists(id)) {
          throw new Error(`User with id '${id}' already exists`);
        }

        if (await this._isUserWithNameExists(name)) {
          throw new Error(`User with name '${name}' already exists`);
        }

        return await this._db
          .get("users")
          .push(User.serialize(user))
          .last()
          .write()
          .then(() => user);
      });
    } catch (error) {
      console.error("MutexError", error);
      throw error;
    }
  }

  async getUsers() {
    return await this._db.get("users").map(User.deserialize).value();
  }

  async _isGameWithIdExists(id) {
    return (await this._db.get("games").find({ id }).value()) != null;
  }

  async addGame(game) {
    try {
      return await this._dbMutex.runExclusive(async () => {
        if (await this._isGameWithIdExists(game.getId())) {
          throw new Error(`Game with id: '${game.getId()}' already exists`);
        }

        return await this._db
          .get("games")
          .push(Game.serialize(game))
          .last()
          .write()
          .then(() => game);
      });
    } catch (error) {
      // TODO: add logging
      console.error("MutexError", error);
      throw error;
    }
  }

  async getGameById(id) {
    const data = await this._db.get("games").find({ id }).value();
    return data != null ? Game.deserialize(data) : null;
  }

  async getGames() {
    const games = await this._db.get("games").value();
    return (games || []).map(Game.deserialize);
  }

  async updateGame(game) {
    await this._db
      .get("games")
      .updateById(game.getId(), Game.serialize(game))
      .write();
    return game;
  }

  async updateUser(user) {
    await this._db
      .get("users")
      .updateById(user.getId(), User.serialize(user))
      .write();
    return user;
  }
};
