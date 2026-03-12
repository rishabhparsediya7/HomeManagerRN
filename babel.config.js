const path = require('path');
const ENVIRONMENT = process.env.ENVIRONMENT ?? 'production';
const envPath = path.resolve(__dirname, `.env.${ENVIRONMENT}`);

module.exports = function (api) {
  api.cache(true);
  require('dotenv').config({
    path: envPath,
  });
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@atoms': './src/components/atoms',
            '@molecules': './src/components/molecules',
            '@organisms': './src/components/organisms',
          },
        },
      ],
      ['inline-dotenv', {path: envPath}],
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: envPath,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
