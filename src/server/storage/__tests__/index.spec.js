const { Storage } = require("../index");
const { Game } = require("../../models/game");
const { User } = require("../../models/user");

describe("Storage", () => {
  let storage = null;
  beforeEach(async () => {
    storage = await Storage.createMemoryStore();
  });

  describe("User", () => {
    it("should add user to storage", async () => {
      const newUser = new User("UserA", "password", "user_1");
      const user = await storage.addUser(newUser);
      expect(user).toEqual(newUser);
    });

    it("should throw error if trying add user with duplicate id", async () => {
      const newUser = new User("UserA", "password", "user_1");
      const user = await storage.addUser(newUser);
      expect(user).toEqual(newUser);

      await expect(storage.addUser(newUser)).rejects.toThrow(
        "User with id 'user_1' already exists"
      );
    });

    it("should throw error if trying add user with duplicate name", async () => {
      const newUser1 = new User("UserA", "password", "user_1");
      const newUser2 = new User("UserA", "password", "user_2");
      const user = await storage.addUser(newUser1);
      expect(user).toEqual(newUser1);

      await expect(storage.addUser(newUser2)).rejects.toThrow(
        `User with name '${newUser2.getName()}' already exists`
      );
    });

    describe("Get User", () => {
      let user = null;
      beforeEach(async () => {
        user = new User("UserA", "password", "user_1");
        await storage.addUser(user);
      });
      afterEach(() => {
        user = null;
      });

      it("should return existing user by id", async () => {
        const user1 = await storage.getUserById(user.getId());
        expect(user1).toEqual(user);
      });

      it("should return existing user by name", async () => {
        const user1 = await storage.getUserByName(user.getName());
        expect(user1).toEqual(user);
      });
    });

    describe("List Users", () => {
      let users = [];
      beforeEach(async () => {
        const newUser1 = new User("UserA", "password", "user_1");
        const newUser2 = new User("UserB", "password", "user_2");
        users = [newUser1, newUser2];
        await Promise.all([
          storage.addUser(newUser1),
          storage.addUser(newUser2)
        ]);
      });

      afterEach(async () => {
        users = [];
      });

      it("should return list of all users", async () => {
        const list = await storage.getUsers();
        expect(list).toEqual(users);
      });
    });
  });

  describe("Game", () => {
    it("should add game to store", async () => {
      const user = new User("UserA", "password", "user_1");
      const game = new Game(user);
      const savedGame = await storage.addGame(game);

      expect(savedGame).toEqual(game);
    });

    it("should throw error if trying add game with duplicate id", async () => {
      const user = new User("UserA", "password", "user_1");
      const game = new Game(user);
      await storage.addGame(game);

      await expect(storage.addGame(game)).rejects.toThrow(
        `Game with id: '${game.getId()}' already exists`
      );
    });

    it("should return existing game by id", async () => {
      const user = new User("UserA", "password", "user_1");
      const game = new Game(user);
      await storage.addGame(game);

      const fetchedGame = await storage.getGameById(game.getId());
      expect(fetchedGame).toEqual(game);
    });

    describe("List Games", () => {
      let games = [];
      beforeEach(async () => {
        const newUser1 = new User("UserA", "password", "user_1");
        const newUser2 = new User("UserB", "password", "user_1");
        games = [new Game(newUser1), new Game(newUser2)];
        await Promise.all(games.map((g) => storage.addGame(g)));
      });

      afterEach(async () => {
        games = [];
      });

      it("should return list of all games", async () => {
        const list = await storage.getGames();
        expect(list).toEqual(games);
      });
    });
  });
});
