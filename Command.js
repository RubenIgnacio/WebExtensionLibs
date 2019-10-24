function Command(options) {
  if (!(this instanceof Command))
    return new Command(options);

  this.browserCommand = Command.browserCommand;
  Object.assign(this, options);
}

Command.browserCommand = WebExtension.getAPI('commands');

Command.getCommandMethod = function(name) {
  let commandMethod = Command.browserCommand[name];
  
  if (!commandMethod)
    throw new Error("Your browser does not support 'Commands." + name + "()'.");
  else if (typeof(commandMethod) !== "function")
    throw new TypeError("'Commands." + name + "' is not a function");
  
  return WebExtension.apiMethodAsPromise(commandMethod);
};

Command.getAll = function() {
  return Command.getCommandMethod("getAll")().then(function(commands) {
    return commands.map((command) => new Command(command));
  });
};

Command.get = function(name) {
  return Command.getAll().then(function(commands) {
    return commands.find((command) => command.name === name);
  });
};

Command.update = function(details) {
  return Command.getCommandMethod("update")(details);
};

Command.addEventListener = function(type, listener) {
  let event = WebExtension.getAPIEvent(Command.browserCommand, type);
  event.addListener(listener);
};

Command.prototype.getCommandMethod = Command.getCommandMethod;

Command.prototype.reload = function() {
  this.getCommandMethod('getAll')().then((commands) => {
    return commands.find((command) => command.name === this.name);
  }).then((command) => Object.assign(this, command));
};

Command.prototype.reset = function() {
  return this.getCommandMethod('reset')(this.name).then(() => this.reload());
};

Command.prototype.update = function(details) {
  details.name = this.name;
  return Command.update(details).then(() => { Object.assign(this, details) });
};
