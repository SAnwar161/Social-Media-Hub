// Mock for expo-modules-core and expo core imports
module.exports = {
  NativeModulesProxy: {},
  EventEmitter: class EventEmitter {},
  requireNativeModule: () => ({}),
  registerRootComponent: () => {},
};
