import { Mutex } from "async-mutex";
import low from "lowdb";
import lodashId from "lodash-id";
import FileAsync from "lowdb/adapters/FileAsync";
import Base from "lowdb/adapters/Base";
import { User } from "../models/user";

import { Game } from "../models/game";

class MemoryAsync extends Base {
  _data = null;
  defaultValue: any;

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

export class DataStorage {
  private _db: any;
  _dbMutex: Mutex;
  static async createMemoryStore(defaultData = { users: [], games: [] }) {
    const adapter = new MemoryAsync("");
    const db = await initDb(adapter, defaultData);
    return new DataStorage(db);
  }

  static async resetMemoryStore(
    storage,
    defaultData = { users: [], games: [] }
  ) {
    const adapter = new MemoryAsync("");
    storage._db = await initDb(adapter, defaultData);
  }

  static async createFileStore(defaultData = { users: [], games: [] }) {
    const adapter = new FileAsync("database.json");
    const db = await initDb(adapter, defaultData);
    return new DataStorage(db);
  }

  constructor(db: low.LowdbAsync<any>) {
    if (!db) {
      throw new Error("Database instance should be provided");
    }

    this._db = db;
    this._dbMutex = new Mutex();
  }

  async _isUserWithNameExists(name: string) {
    return (await this._db.get("users").find({ name }).value()) != null;
  }

  async _isUserWithIdExists(id) {
    return (await this._db.get("users").find({ id }).value()) != null;
  }

  async getUserById(id): Promise<User | null> {
    const data = await this._db.get("users").find({ id }).value();
    return data != null ? User.deserialize(data) : null;
  }

  async getUserByName(name): Promise<User | null> {
    const data = await this._db.get("users").find({ name }).value();
    return data != null ? User.deserialize(data) : null;
  }

  async addUser(user: User) {
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
    return (await this._db
      .get("users")
      .map(User.deserialize)
      .value()) as User[];
  }

  async _isGameWithIdExists(id) {
    return (await this._db.get("games").find({ id }).value()) != null;
  }

  async addGame(game: Game) {
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

  async getGameById(id): Promise<Game | null> {
    const data = await this._db.get("games").find({ id }).value();
    return data != null ? Game.deserialize(data) : null;
  }

  async getGames() {
    const games = await this._db.get("games").value();
    return (games || []).map(Game.deserialize) as Game[];
  }

  async updateGame(game: Game) {
    await this._db
      .get("games")
      .updateById(game.getId(), Game.serialize(game))
      .write();
    return game;
  }

  async updateUser(user: User) {
    await this._db
      .get("users")
      .updateById(user.getId(), User.serialize(user))
      .write();
    return user;
  }
}
