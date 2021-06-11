export class Context {
  static get storage() {
    if (this._storage == null) {
      console.error("Storage is not initialized");
      throw new Error("Storage is not initialized");
    }
    return this._storage;
  }

  static set storage(value) {
    this._storage = value;
  }

  static _storage;
}
