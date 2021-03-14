exports.Context = class Context {
  static get storage() {
    return this._storage;
  }

  static set storage(value) {
    this._storage = value;
  }

  static _storage;
};
