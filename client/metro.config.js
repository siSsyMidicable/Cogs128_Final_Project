const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
config.resolver.alias = {'@': path.resolve(__dirname, '.')};
config.resolver.extraNodeModules = {
  'stripe/stripe-react-native': path.resolve(__dirname, 'shims/stripe-shim.ts')
};
module.exports = config;
