function StorageManager(defaultStorageAreaType) {
  if (!(this instanceof StorageManager))
    return new StorageManager(defaultStorageAreaType);

  this.browserStorage = WebExtension.getAPI('storage');
  this.setDefaultStorageAreaType(defaultStorageAreaType);
}

StorageManager.browserStorage = WebExtension.getAPI('storage', true);

StorageManager.StorageAreaType = {LOCAL: 'local', SYNC: 'sync', MANAGED: 'managed'};

StorageManager.addEventListener = function(type, listener) {
  let event = WebExtension.getAPIEvent(StorageManager.browserStorage, type);
  event.addListener(listener);
};

StorageManager.prototype.addEventListener = StorageManager.addEventListener;

StorageManager.prototype.setDefaultStorageAreaType = function(newDefaultStorageAreaType) {
  if (newDefaultStorageAreaType == null)
    newDefaultStorageAreaType = StorageManager.StorageAreaType.LOCAL;

  this.getStorage(newDefaultStorageAreaType);
  this.defaultStorageAreaType = newDefaultStorageAreaType;
};

StorageManager.prototype.getStorage = function(storageAreaType) {
  if (storageAreaType == null) storageAreaType = this.defaultStorageAreaType;

  var storageAreaTypes = Object.values(StorageManager.StorageAreaType);
  if (!storageAreaTypes.includes(storageAreaType))
    throw new TypeError("Storage area '" + storageAreaType + "' is invalid.");

  var storage = this.browserStorage[storageAreaType];
  if (!storage)
    throw new Error("Your browser does not support 'Storage." + storageAreaType + "'.");
  return storage;
};

StorageManager.prototype.getStorageMethod = function(name, storageAreaType) {
  var storage = this.getStorage(storageAreaType);
  var storageMethod = storage[name].bind(storage);

  if (!storageMethod)
    throw new Error("Your browser does not support 'Storage." + storageAreaType + "." + name + "()'.");
  else if (typeof(storageMethod) !== "function")
    throw new TypeError("'Storage." + name + "' is not a function");

  return WebExtension.apiMethodAsPromise(storageMethod);
};

['get', 'getBytesInUse', 'set', 'remove'].forEach(function(methodName) {
  StorageManager.prototype[methodName] = function(keysItems, storageAreaType) {
    return this.getStorageMethod(methodName, storageAreaType)(keysItems);
  };
});

StorageManager.prototype.clear = function(storageAreaType) {
  return this.getStorageMethod('clear', storageAreaType)();
};
