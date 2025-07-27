//Chat.js: Файл для реализации логики чата.
import ChatAPI from './api/ChatAPI';
import createRequest from './api/createRequest';

export default class Chat {
  /**
   * Конструктор инициализирует контейнер и ChatAPI.
   * @param {HTMLElement} container - DOM элемент для рендера чата.
   */
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.user = null;
  }

  /**
   * Инициализация чата: рендер модального окна и регистрация событий.
   */
  init() {
    this.renderModal();
    this.registerEvents();
  }

  /**
   * Рендер модального окна для ввода никнейма.
   */
  renderModal() {
    this.container.innerHTML = `
      <div class="modal__form active" id="modal">
        <div class="modal__background"></div>
        <div class="modal__content">
          <div class="modal__header" style="background-color: #4B53D0; color: white;">Привет! Ждёте волну позитива - вам сюда!</div>
          <div class="modal__body">
            <div class="form__group">
              <input type="text" id="nickname" class="form__input" placeholder="Введите Никнейм" />
              <div class="form__hint" id="hint"></div>
            </div>
          </div>
          <div class="modal__footer">
          <button class="modal__register" id="registerBtn">Регистрация</button>
          <button class="modal__ok" id="okBtn">Войти</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Рендер основного окна чата с областью сообщений и списком пользователей.
   */
  renderChat() {
    console.log('renderChat called - rendering chat window with logout button');
    this.container.innerHTML = `
      <div class="container">
        <div class="chat__userlist-column">
          <h1 class="chat__header">Chat online</h1>
          <div class="chat__userlist" id="userList"></div>
        </div>
        <div class="chat__container">
          <div class="chat__area">
            <div class="chat__messages-container" id="messages"></div>
            <div class="chat__messages-input">
              <input type="text" id="messageInput" class="form__input" placeholder="Введите сообщение" />
            </div>
            <div class="chat__buttons">
              <button id="emojiBtn" class="emoji-btn" title="Выбрать смайлик">😊</button>
              <button id="sendBtn" class="modal__ok">Отправить</button>
              <button id="logoutBtn" class="chat__logout-btn">Выйти</button>
              <button id="leaveBtn" class="chat__leave-btn">Покинуть чат</button>
            </div>
            <div id="emojiPicker" class="emoji-picker hidden"></div>
          </div>
        </div>
      </div>
    `;
    this.renderEmojiPicker();
  }

  /**
   * Рендер выборника смайлов.
   */
  renderEmojiPicker() {
    const emojiPicker = this.container.querySelector('#emojiPicker'); // Находим выбор смайлов
    if (!emojiPicker) return; // Если не найден, выходим
    const emojis = [
        '😀', '😂', '😍', '😎', '😢', '😡', 
        '👍', '🙏', '🎉', '💔', '🔥', '🌟', 
        '💯', '🎈', '🥳', '🤔', '😜', '😇', 
        '😻', '🙌', '🤗', '😋', '🥺', '🤩', 
        '💖', '✨', '🌈', '🌻', '🌼', '🍀',
        '🎊', '🍕', '🎶', '☕', '🍩', '🌍'
    ];
    emojiPicker.innerHTML = ''; // Очищаем выбор смайлов
    emojis.forEach((emoji) => {
        const span = document.createElement('span'); // Создаем элемент для каждого смайла
        span.classList.add('emoji'); // Добавляем класс
        span.textContent = emoji; // Устанавливаем текст смайла
        emojiPicker.appendChild(span); // Добавляем смайл в выбор
    });
}

  /**
   * Регистрация событий модального окна для ввода никнейма.
   */
  registerEvents() {
    const modal = this.container.querySelector('#modal'); // Находим модальное окно
    const okBtn = this.container.querySelector('#okBtn'); // Находим кнопку "Войти"
    const registerBtn = this.container.querySelector('#registerBtn'); // Находим кнопку "Регистрация"
    const nicknameInput = this.container.querySelector('#nickname'); // Находим поле для никнейма
    const hint = this.container.querySelector('#hint'); // Находим элемент для подсказок
    // Обработчик события для кнопки "Войти"
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim(); // Получаем никнейм
        if (!nickname) {
          hint.textContent = 'Введите никнейм'; // Если никнейм пустой, выводим подсказку
          return;
        }
        // Вход: подключаемся к WebSocket без повторной регистрации
        this.api
          .connect(nickname)
          .then(() => {
            console.log('Connected to WebSocket - then handler called');
            // Логируем успешное подключение
            this.user = { name: nickname };
            // Сохраняем информацию о пользователе
            console.log('User set to:', this.user);
            // Логируем пользователя
            this.renderChat(); // Рендерим окно чата
            this.subscribeOnEvents(); // Подписываемся на события
            this.bindUIEvents(); // Привязываем события UI
          })
          .catch((error) => {
            console.error('Login error:', error); // Логируем ошибку
            hint.textContent =
              error.message || 'Ошибка входа, проверьте никнейм'; // Выводим ошибку
          });
      });
    }
    // Обработчик события для кнопки "Регистрация"
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim(); // Получаем никнейм
        if (!nickname) {
          hint.textContent = 'Введите никнейм для регистрации';
          // Если никнейм пустой, выводим подсказку
          return;
        }
        createRequest(nickname) // Запрос на создание пользователя
          .then((user) => {
            console.log('User registered via register button:', user);
            // Логируем успешную регистрацию
            hint.textContent = 'Регистрация успешна! Теперь нажмите Войти.';
            // Подсказка для пользователя
          })
          .catch((error) => {
            console.error('Registration error:', error);
            // Логируем ошибку регистрации
            hint.textContent = error.message || 'Ошибка регистрации';
            // Выводим ошибку
          });
      });
    }
  }
  /**
   * Привязка событий UI для отправки сообщений.
   */
  bindUIEvents() {
    const sendBtn = this.container.querySelector('#sendBtn'); // Находим кнопку "Отправить"
    const messageInput = this.container.querySelector('#messageInput'); // Находим поле для ввода сообщения
    const logoutBtn = this.container.querySelector('#logoutBtn'); // Находим кнопку "Выйти"
    const emojiBtn = this.container.querySelector('#emojiBtn'); // Находим кнопку выбора смайлов
    const emojiPicker = this.container.querySelector('#emojiPicker'); // Находим выбор смайлов
    const leaveBtn = this.container.querySelector('#leaveBtn'); // Находим кнопку "Покинуть чат"
    // Обработчик события для кнопки "Отправить"
    sendBtn.addEventListener('click', () => {
      this.sendMessage(); // Отправляем сообщение
    });
    // Обработчик события для нажатия клавиши Enter
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage(); // Отправляем сообщение
      }
    });
    // Обработчик события для кнопки выбора смайлов
    if (emojiBtn && emojiPicker) {
      emojiBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle('hidden'); // Показываем или скрываем выбор смайлов
      });
      emojiPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji')) {
          // Если кликнули по смайлу
          const emoji = e.target.textContent; // Получаем текст смайла
          messageInput.value += emoji; // Добавляем смайл в поле ввода сообщения
          emojiPicker.classList.add('hidden'); // Скрываем выбор смайлов
          messageInput.focus(); // Ставим фокус обратно на поле ввода
        }
      });
    }
    // Обработчик события для кнопки "Выйти"
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (this.api.socket) {
          this.api.send({
            type: 'disconnect', // Отправляем сообщение о отключении
            user: this.user,
          });
          this.api.socket.close(); // Закрываем сокет
        }
        this.user = null; // Сбрасываем пользователя
        this.renderModal(); // Рендерим модальное окно
        this.registerEvents(); // Регистрируем события
      });
    }
    // Обработчик события для кнопки "Покинуть чат"
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        if (this.api.socket) {
          this.api.send({
            type: 'exit', // Отправляем сообщение о выходе
            user: this.user,
          });
          this.api.socket.close(); // Закрываем сокет
        }
        this.user = null; // Сбрасываем пользователя
        this.renderModal(); // Рендерим модальное окно
        this.registerEvents(); // Регистрируем события
      });
    }
  }

  /**
   * Подписка на события WebSocket через ChatAPI.
   */
  subscribeOnEvents() {
    this.api.onMessage((data) => {
      this.renderMessage(data); // Рендерим сообщение
    });
    this.api.onUsersUpdate((users) => {
      this.renderUserList(users); // Рендерим список пользователей
    });
  }
  /**
   * Отправка сообщения через ChatAPI.
   */
  sendMessage() {
    const messageInput = this.container.querySelector('#messageInput');
    // Находим поле для ввода сообщения
    const message = messageInput.value.trim(); // Получаем текст сообщения
    if (!message) return; // Если сообщение пустое, выходим
    this.api.sendMessage(message, this.user); // Отправляем сообщение
    messageInput.value = ''; // Очищаем поле ввода
  }

  /**
   * Рендер сообщения в окне чата.
   * @param {Object} data - Данные сообщения.
   */
  renderMessage(data) {
    const messagesContainer = this.container.querySelector('#messages');
    // Находим контейнер для сообщений
    if (!messagesContainer) return; // Если контейнер не найден, выходим
    const isOwnMessage = data.user.name === this.user.name;
    // Проверяем, принадлежит ли сообщение текущему пользователю
    const messageContainer = document.createElement('div');
    // Создаем контейнер для сообщения
    messageContainer.classList.add('message__container');
    // Добавляем класс контейнеру сообщения
    messageContainer.classList.add(
      isOwnMessage
        ? 'message__container-yourself'
        // Если сообщение от текущего пользователя
        : 'message__container-interlocutor'
      // Если сообщение от другого пользователя
    );
    const header = document.createElement('div');
    // Создаем элемент заголовка сообщения
    header.classList.add('message__header');
    // Добавляем класс заголовку
    const date = new Date(data.timestamp || Date.now());
    // Получаем дату сообщения
    const formattedDate = date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    header.textContent = isOwnMessage
      ? `You, ${formattedDate}`
      : // Формат заголовка для собственного сообщения
        `${data.user.name}, ${formattedDate}`;
    // Формат заголовка для сообщения от другого пользователя
    const messageBody = document.createElement('div');
    // Создаем элемент для текста сообщения
    messageBody.textContent = data.message;
    // Устанавливаем текст сообщения
    messageContainer.appendChild(header);
    // Добавляем заголовок в контейнер сообщения
    messageContainer.appendChild(messageBody);
    // Добавляем текст сообщения в контейнер
    messagesContainer.appendChild(messageContainer);
    // Добавляем контейнер сообщения в контейнер сообщений
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    // Прокручиваем контейнер вниз
  }

  /**
   * Рендер списка пользователей в окне чата.
   * @param {Array} users - Массив пользователей.
   */
  renderUserList(users) {
    const userList = this.container.querySelector('#userList');
    // Находим контейнер для списка пользователей
    if (!userList) return; // Если контейнер не найден, выходим
    userList.innerHTML = ''; // Очищаем список пользователей
    users.forEach((user) => {
      const userDiv = document.createElement('div');
      // Создаем элемент для пользователя
      userDiv.classList.add('chat__user'); // Добавляем класс пользователю
      if (this.user && user.name === this.user.name) {
        userDiv.textContent = `${user.name} (You)`; // Если это текущий пользователь
        userDiv.classList.add('chat__user-yourself'); // Добавляем класс для выделения
      } else {
        userDiv.textContent = user.name; // Если это другой пользователь
      }
      userList.appendChild(userDiv); // Добавляем пользователя в список
    });
  }
}
