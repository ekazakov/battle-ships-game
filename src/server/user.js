const getNextId = require("../common/id-generator");

module.exports = class User {
  constructor(name, password) {
    this._name = name;
    this._password = password;
    this._id = getNextId("user");
  }

  getName() {
    return this._name;
  }

  getId() {
    return this._id;
  }

  isLoginAndPasswordValid(name, password) {
    return this._password === password && this._name === name;
  }
};
