const getNextId = require("../common/id-generator");

module.exports = class User {
  constructor(name, password) {
    this._name = name;
    this._password = password;
    this._id = getNextId("user");
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

  isLoginAndPasswordValid(name, password) {
    return this._password === password && this._name === name;
  }
};
