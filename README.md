# Приложение "ECHOROOM Chat"
(к теме "EventSource, Websockets")

![CI](https://github.com/NMYurchenko-max/ws-chat-frontend/actions/workflows/web.yml/badge.svg)

[deploy](https://nmyurchenko-max.github.io/ws-chat-frontend/)

## Чат

### Легенда
В рамках реализации корпоративного портала вам поручили организовать чат, и вы решили для этого использовать веб-сокеты.

### Описание
1. **Серверная часть** реализована. Ознакомьтесь для понимания, клонируйте для использования.
   - Rest-сервер (Express) для работы с чатом написан в 
  
  [chat-backend](https://github.com/NMYurchenko-max/chat-backend.git) и запущен.

   - Доступен по адресу: https://chat-backend-340a.onrender.com.

2. **Клиентская часть**.
   - Структура исходных файлов:
   ```plaintext
   chat-frontend
   ├── src
   │   ├── index.html
   │   ├── index.js
   │   ├── images/
   │   │   ├── logo-EchoRoom.png
   │   │   └── lecho-bg.jpeg
   │   ├── css/
   │   │   ├── modal.css
   │   │   └── style.css
   │   ├── js/
   │   │   ├── api/
   │   │   │   ├── ChatAPI.js
   │   │   │   └── createRequest.js
   │   │   ├── Chat.js
   │   │   └── app.js
   │   └── favicon.ico
   ```

   - Я добавила свой `favicon.ico`.

## Использование
[ws-chat-frontend](https://github.com/NMYurchenko-max/ws-chat-frontend.git)

Для решения проблемы работы с локальным сервером и Rest-сервером (Express) я использовала `localhost` и

 `https://chat-backend-340a.onrender.com` соответственно, 
 
 добавив в код `ChatAPI.js` и `createRequest.js` выбор сервера в зависимости от окружения:

```javascript
const BACKEND_WS_URL = window.location.hostname === 'localhost' 
? 'ws://localhost:3000' : 'wss://chat-backend-340a.onrender.com';
```

---

## Реализация задачи
В данной реализации клиентского чата использован WebSocket для обмена сообщениями с сервером.

### Алгоритм работы
1. При загрузке страницы отображается модальное окно с запросом никнейма для регистрации и для входа (если уже зарегистрирован).
2. Пользователь вводит никнейм и отправляет запрос на сервер для проверки доступности.
3. Если никнейм свободен, открывается основное окно чата с областью сообщений и списком пользователей.
4. Через WebSocket происходит обмен сообщениями:
   - Отправка сообщений пользователем.
   - Получение сообщений от других пользователей.
   - Обновление списка подключенных пользователей.
5. Сообщения пользователя выравниваются по правому краю с пометкой "You", сообщения других — по левому.
6. При отключении пользователя он удаляется из списка пользователей — удаление производится, если он нажал кнопку "Покинуть чат".

### Используемые методы и классы
- **ChatAPI** — класс для работы с WebSocket:
  - `connect(nickname)` — подключение и регистрация никнейма.
  - `sendMessage(message, user)` — отправка сообщения.
  - Подписки на события: новые сообщения, обновление списка пользователей, статус никнейма.
  
- **Chat** — класс для UI и логики клиента:
  - `init()` — инициализация UI.
  - `renderModal()` — рендер модального окна.
  - `renderChat()` — рендер основного окна чата.
  - `registerEvents()` — обработка событий UI.
  - `subscribeOnEvents()` — подписка на события WebSocket.
  - `sendMessage()` — отправка сообщения.
  - `renderMessage(data)` — отображение сообщения.
  - `renderUserList(users)` — отображение списка пользователей.

### Структура сообщения
```json
{
  "type": "send",
  "message": "Hello world!",
  "user": {
    "id": "269719e1-45e3-4c11-b9df-a54d20532966",
    "name": "TestUser"
  }
}
```

### Зависимости
- Используется WebSocket API браузера.
- В проекте настроен Webpack для сборки.

### Тестирование
Реализованы e2e тесты с использованием Puppeteer для проверки функциональности чата с созданием скриншотов.
Настройка для использования cros-платформенного окружения:
```js
// Динамическое определение url для backend
  const BACKEND_WS_URL =
    process.env.BACKEND_WS_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'ws://localhost:3000'
      : 'wss://chat-backend-340a.onrender.com');
// Проверяем, запущен ли тест в CI
    const isCI = process.env.CI === 'true';
    browser = await puppeteer.launch({
      headless: isCI, // Запускаем браузер в headless режиме, если это CI
      slowMo: isCI ? 0 : 200, // Замедляем выполнение в локальном режиме
      args: isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    });
```

Скрипт для запуска:
`"test:e2e": "cross-env NODE_ENV=development jest --testPathPatterns=./e2e/ --runInBand"`
Команда:
`yarn test:e2e`
---

### Использование
1. **"Установка"**:

   1. Клонируйте репозиторий:
      ```bash
      git clone https://github.com/NMYurchenko-max/ws-chat-frontend.git
      ```
   2. Перейдите в директорию проекта:
      ```bash
      cd ws-chat-frontend
      ```
   3. Установите зависимости:
      ```bash
      yarn install
      ```
   ```

2. **Запуске**: 
  Сервер:Клонируйте репозиторий cервера
  [chat-backend](https://github.com/NMYurchenko-max/chat-backend.git), перейдите в директорию проекта и разверните его аналогично, запустите сервер:
  `npm start` , или `npm run dev` с отслеживанием изменений.
  Клиент: Запустите клиент: `yarn build && yarn start`. 
  
3. **Запуск тестов**: 
   `yarn test:e2e`

4. [**Лицензия**:](./LICENSE)
