module.exports = function (api) {
  // this line will cause the env file to be cached
  // this is why the .env file will get "stuck", just clear the cache
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env"
      }],
    ]
  };
};
