const { getNextId } = require("../utils/id-generator");

exports.User = class User {
  static createUser(name, password) {
    return new User(name, password, getNextId("user"));
  }

  constructor(name, password, id) {
    this._name = name;
    this._password = password;
    this._id = id;
    this._gameId = null;
  }

  getName() {
    return this._name;
  }

  getId() {
    return this._id;
  }

  setGame(gameId) {
    this._gameId = gameId;
  }

  getGameId() {
    return this._gameId;
  }

  getInfo() {
    return { name: this.getName(), id: this.getId(), gameId: this.getGameId() };
  }

  isLoginAndPasswordValid(name, password) {
    return this._password === password && this._name === name;
  }

  static serialize(user) {
    return {
      name: user._name,
      password: user._password,
      id: user._id,
      gameId: user._gameId
    };
  }

  static deserialize(userData) {
    const user = new User();
    return Object.assign(user, {
      _name: userData.name,
      _password: userData.password,
      _id: userData.id,
      _gameId: userData.gameId
    });
  }
};
