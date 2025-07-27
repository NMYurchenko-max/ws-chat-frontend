const webpack = require("webpack"); // Импортируем Webpack
const { merge } = require("webpack-merge"); // Импортируем функцию merge для объединения конфигураций
const common = require("./webpack.common"); // Импортируем общую конфигурацию Webpack

module.exports = merge(common, {
  // Устанавливаем режим разработки
  mode: "development",
  // Контролируем, как генерируются карты исходного кода
  devtool: "inline-source-map",

  // Настраиваем сервер разработки для быстрого тестирования
  devServer: {
    historyApiFallback: true, // Позволяет использовать HTML5 History API
    open: true, // Автоматически открывает браузер при запуске сервера
    compress: true, // Включает сжатие gzip для всех исходящих данных
    port: 8080, // Устанавливаем порт, на котором будет запущен сервер
    hot: true, // Включаем горячую замену модулей (HMR)
  },

  plugins: [
    // Плагин для горячей замены модулей
    new webpack.HotModuleReplacementPlugin(),
  ],
});
