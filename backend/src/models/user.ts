import { getNextId } from "../utils/id-generator";

export class User {
  private readonly name: string;
  private readonly password: string;
  private readonly id: string;
  private gameId: string;

  static createUser(name, password) {
    return new User(name, password, getNextId("user"));
  }

  constructor(name, password, id) {
    this.name = name;
    this.password = password;
    this.id = id;
    this.gameId = null;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  setGame(gameId) {
    this.gameId = gameId;
  }

  getGameId() {
    return this.gameId;
  }

  getInfo() {
    return { name: this.getName(), id: this.getId(), gameId: this.getGameId() };
  }

  isLoginAndPasswordValid(name, password) {
    return this.password === password && this.name === name;
  }

  static serialize(user) {
    return {
      name: user.name,
      password: user.password,
      id: user.id,
      gameId: user.gameId
    };
  }

  static deserialize(userData) {
    const user = new User(userData.name, userData.password, userData.id);
    user.setGame(userData.gameId);
    return user;
  }
}
