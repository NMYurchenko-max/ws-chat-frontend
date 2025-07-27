//app.js: Файл для инициализации чата при загрузке страницы.
import Chat from './Chat'; // Импортируем класс Chat
// Код для инициализации чата при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root'); // Находим корневой контейнер
  if (container) {
    const chat = new Chat(container); // Создаем экземпляр чата
    chat.init(); // Инициализируем чат
  }
});
