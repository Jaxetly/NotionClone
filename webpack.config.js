const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/index.js', // Входная точка вашего приложения
  output: {
    filename: 'index.bundle.js', // Имя выходного файла
    path: path.resolve(__dirname, 'bin'), // Папка для выходных файлов
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Применять правила к файлам .js
        exclude: /node_modules/, // Исключить папку node_modules
        use: {
          loader: 'babel-loader', // Использовать Babel для транспиляции
          options: {
            presets: ['@babel/preset-env'], // Пресет для ES6+
          },
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
};
