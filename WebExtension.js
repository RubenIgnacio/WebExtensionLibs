var WebExtension = {
  browser: self.browser || self.chrome,
  supportPromises: () => {
    if (self.browser) return /Firefox/.test(navigator.userAgent);
    return false;
  },
  getAPI: (apiName, silent) => {
    let api = WebExtension.browser[apiName];

    if (!api) {
      if (silent) return null;
      throw new Error('Your browser does not support ' + apiName + '.');
    }
    return api;
  },
  apiMethodAsPromise: (apiMethod) => {
    if (WebExtension.supportPromises()) return apiMethod;

    return function() {
      let args = Array.from(arguments);
      return new Promise((resolve, reject) => {
        args.push(function(value) {
          let runtimeError = WebExtension.getAPI('runtime').lastError;
          if (runtimeError)
            reject(runtimeError);
          else
            resolve(value);
        });
        apiMethod.apply(null, args);
      });
    };
  },
  getAPIEvent: (api, type) => {
    type = "on" + type[0].toUpperCase() + type.substring(1);
    let event = api[type];
    if (!event)
      throw new Error("Your browser does not support '" + type + "' event.");
    return event;
  }
};
