//createRequest.js: Файл для создания нового пользователя.
// Определяем URL для бэкенда в зависимости от окружения (локальный или продакшн)
const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://chat-backend-340a.onrender.com';
/**
 * Функция для создания нового пользователя.
 * @param {string} name - Никнейм пользователя.
 * @returns {Promise<Object>} - Объект пользователя, созданного на сервере.
 */
const createRequest = async (name) => {
  try {
    console.log('Sending create user request for:', name);
    // Логируем отправку запроса на создание пользователя
    const response = await fetch(`${BACKEND_URL}/new-user`, {
      method: 'POST', // Метод запроса
      headers: {
        'Content-Type': 'application/json', // Указываем тип контента
      },
      body: JSON.stringify({ name }),
      // Отправляем никнейм в теле запроса
    });
    console.log('Response status:', response.status);
    // Логируем статус ответа
    // Проверяем, успешен ли ответ
    if (!response.ok) {
      if (response.status === 409) {
        console.error('Nickname taken error from server');
        // Логируем ошибку, если никнейм занят
        throw new Error('Никнейм занят, выберите другой');
        // Генерируем ошибку для клиента
      }
      const errorData = await response.json();
      // Получаем данные об ошибке
      console.error('Error data from server:', errorData);
      // Логируем данные об ошибке
      throw new Error(errorData.message || 'Failed to create user');
      // Генерируем ошибку
    }
    const data = await response.json(); // Получаем данные пользователя
    console.log('User created:', data.user); // Логируем созданного пользователя
    return data.user; // Возвращаем объект пользователя
  } catch (error) {
    console.error('Error creating user:', error);
    // Логируем ошибку при создании пользователя
    throw error; // Генерируем ошибку
  }
};
export default createRequest;
// Экспортируем функцию для использования в других модулях
