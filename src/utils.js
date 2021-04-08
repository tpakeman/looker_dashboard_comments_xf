export function lookerCaller(sdk) {
    return function(apiMethod, ...args) {
      return sdk.ok(sdk[apiMethod](...args))
    }
}