function WindowManager(windowInfo) {
  if (!(this instanceof WindowManager))
    return new WindowManager(windowInfo);

  this.browserWindows = WindowManager.browserWindows;
  if (!this.browserWindows)
    throw new Error("Your browser does not support windows.");

  for (let prop in windowInfo)
    this[prop] = windowInfo[prop];
}

WindowManager.browserWindows = (window.browser || window.chrome).windows;

WindowManager.WindowType = WindowManager.browserWindows.WindowType;

WindowManager.WindowState = WindowManager.browserWindows.WindowState;

WindowManager.CreateType = WindowManager.browserWindows.CreateType;

WindowManager.WINDOW_ID_NONE = WindowManager.browserWindows.WINDOW_ID_NONE;

WindowManager.WINDOW_ID_CURRENT = WindowManager.browserWindows.WINDOW_ID_CURRENT;

WindowManager.getWindowMethod = function(name) {
  var windowMethod = WindowManager.browserWindows[name];

  if (!windowMethod)
    throw new Error("Your browser does not support 'Windows." + name + "()'.");
  else if (typeof(windowMethod) !== "function")
    throw new TypeError("'Windows." + name + "' is not a function");

  if (window.browser)
    return windowMethod;
  else {
    return function() {
      var args = Array.from(arguments);
      return new Promise(function(resolve, reject) {
        args.push(function(value) {
          var runtimeError = chrome.runtime.lastError;
          if (runtimeError)
            reject(runtimeError);
          else
            resolve(value);
        });
        windowMethod.apply(null, args);
      });
    };
  }
};

WindowManager.open = function(createData) {
  return WindowManager.getWindowMethod("create")(createData).then((windowInfo) => new WindowManager(windowInfo));
};

WindowManager.getAll = function(getInfo) {
  return WindowManager.getWindowMethod("getAll")(getInfo).then(function(windowInfoArray) {
    return windowInfoArray.map((windowInfo) => new WindowManager(windowInfo));
  });
};

WindowManager.get = function(windowId, getInfo) {
  return WindowManager.getWindowMethod("get")(windowId, getInfo).then((windowInfo) => new WindowManager(windowInfo));
};

["getCurrent", "getLastFocused"].forEach(function(methodName) {
  WindowManager[methodName] = function(getInfo) {
    return WindowManager.getWindowMethod(methodName)(getInfo).then((windowInfo) => new WindowManager(windowInfo));
  };
});

WindowManager.addEventListener = function(type, listener) {
  type = "on" + type[0].toUpperCase() + type.substring(1);
  var event = WindowManager.browserWindows[type];
  if (!event)
    throw new Error("Your browser does not support '" + type + "' event.");
  event.addListener(listener);
};

WindowManager.prototype.getWindowMethod = WindowManager.getWindowMethod;

WindowManager.prototype.update = function(updateInfo) {
  var thisWindow = this;
  return this.getWindowMethod("update")(this.id, updateInfo).then(function(windowInfo) {
    for (let key in updateInfo) {
      if (key !== "drawAttention" && key !== "titlePreface")
        thisWindow[key] = updateInfo[key];
    }
    return thisWindow;
  });
};

WindowManager.prototype.close = function() {
  return this.getWindowMethod("remove")(this.id);
};