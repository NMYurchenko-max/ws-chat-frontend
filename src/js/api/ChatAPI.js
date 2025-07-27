/**
 * Класс ChatAPI реализует работу с WebSocket сервером для чата.
 * Отвечает за подключение, отправку и получение сообщений, а также обновление списка пользователей.
 */
const BACKEND_WS_URL = window.location.hostname === 'localhost' ? 'ws://localhost:3000' : 'wss://chat-backend-340a.onrender.com';

export default class ChatAPI {
  /**
   * Конструктор инициализирует свойства класса.
   */
  constructor() {
    /**
     * WebSocket соединение.
     * @type {WebSocket|null}
     */
    this.socket = null;

    /**
     * Объект с массивами колбэков для различных событий.
     */
    this.listeners = {
      message: [],       // События новых сообщений
      users: [],         // Обновление списка пользователей
      nicknameStatus: [],// Статус проверки никнейма
    };
  }

  /**
   * Метод подключения к WebSocket серверу и регистрации никнейма.
   * @param {string} nickname - Никнейм пользователя.
   * @returns {Promise} - Резолвится при успешной регистрации, реджектится при ошибке.
   */
  connect(nickname) {
    return new Promise((resolve, reject) => {
      console.log('ChatAPI: connecting to WebSocket at', BACKEND_WS_URL);
      this.socket = new WebSocket(BACKEND_WS_URL);

      let resolved = false;

      // Обработчик открытия соединения
      this.socket.addEventListener('open', () => {
        console.log('ChatAPI: WebSocket connection opened');
        // Отправляем серверу запрос на регистрацию никнейма
        this.send({
          type: 'connect',
          user: { name: nickname },
        });
      });

      // Обработчик входящих сообщений
      this.socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('ChatAPI: received message', data);

        if (data.type === 'connect') {
          // Ответ сервера о статусе регистрации никнейма
          this.listeners.nicknameStatus.forEach((cb) => cb(data));
          if (data.status === 'ok') {
            console.log('ChatAPI: connection accepted');
            if (!resolved) {
              resolved = true;
              resolve();
            }
          } else {
            console.log('ChatAPI: connection rejected');
            if (!resolved) {
              resolved = true;
              reject(new Error('Nickname is already taken'));
            }
          }
        } else if (Array.isArray(data)) {
          // Если пришел массив, считаем это списком пользователей и успешным подключением
          console.log('ChatAPI: connection accepted via array message');
          if (!resolved) {
            resolved = true;
            resolve();
          }
          this.listeners.users.forEach((cb) => cb(data));
        } else if (data.type === 'message' || data.type === 'send') {
          // Новое сообщение
          this.listeners.message.forEach((cb) => cb(data));
          // Если сообщение содержит массив пользователей, считаем подключение успешным
          if ((data.users && Array.isArray(data.users)) && !resolved) {
            console.log('ChatAPI: connection accepted via message with users');
            resolved = true;
            resolve();
          }
        } else if (data.type === 'users') {
          // Обновление списка пользователей
          this.listeners.users.forEach((cb) => cb(data.users));
          // При получении списка пользователей считаем, что подключение успешно
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }
      });

      // Обработчик закрытия соединения
      this.socket.addEventListener('close', () => {
        console.log('ChatAPI: WebSocket connection closed');
        // Здесь можно обработать закрытие соединения, если нужно
      });

      // Обработчик ошибок соединения
      this.socket.addEventListener('error', (error) => {
        console.log('ChatAPI: WebSocket error', error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });
    });
  }

  /**
   * Метод отправки данных на сервер через WebSocket.
   * @param {Object} data - Данные для отправки.
   */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  /**
   * Метод отправки сообщения в чат.
   * @param {string} message - Текст сообщения.
   * @param {Object} user - Объект пользователя, отправляющего сообщение.
   */
  sendMessage(message, user) {
    this.send({
      type: 'send',
      message,
      user,
    });
  }

  /**
   * Подписка на событие новых сообщений.
   * @param {function} callback - Функция обратного вызова.
   */
  onMessage(callback) {
    this.listeners.message.push(callback);
  }

  /**
   * Подписка на обновление списка пользователей.
   * @param {function} callback - Функция обратного вызова.
   */
  onUsersUpdate(callback) {
    this.listeners.users.push(callback);
  }

  /**
   * Подписка на статус проверки никнейма.
   * @param {function} callback - Функция обратного вызова.
   */
  onNicknameStatus(callback) {
    this.listeners.nicknameStatus.push(callback);
  }
}
