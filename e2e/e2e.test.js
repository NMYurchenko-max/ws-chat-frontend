import puppeteer from 'puppeteer';
import { fork } from 'child_process';
import fs from 'fs';
import path from 'path';
jest.setTimeout(70000);
describe('Chat E2E Tests', () => {
  let browser;
  let page;
  let serverProcess;
  // Динамическое определение url для backend
  const BACKEND_WS_URL =
    process.env.BACKEND_WS_URL ||
    (process.env.NODE_ENV === 'development' // Проверяем, находится ли приложение в режиме разработки
      ? 'ws://localhost:3000' // Если да, используем локальный WebSocket
      : 'wss://chat-backend-340a.onrender.com'); // В противном случае используем удалённый WebSocket
  const baseUrl = 'http://localhost:8080'; // URL нашего приложения
  const screenshotsDir = path.resolve(__dirname, 'screenshots'); // Папка для скриншотов
  beforeAll(async () => {
    serverProcess = fork('e2e/e2e.server.js'); // Запускаем серверное приложение
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir); // Создаем директорию для скриншотов, если она не существует
    }
    const isCI = process.env.CI === 'true'; // Проверяем, запущен ли тест в CI
    browser = await puppeteer.launch({
      headless: isCI, // Запускаем браузер в headless режиме, если это CI
      slowMo: isCI ? 0 : 200, // Замедляем выполнение в локальном режиме
      args: isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    });
    page = await browser.newPage(); // Открываем новую страницу в браузере
  });
  afterAll(async () => {
    await browser.close(); // Закрываем браузер после всех тестов
    serverProcess.kill(); // Завершаем серверный процесс
  });
  const registerUser = async (nickname) => {
    await page.type('#nickname', nickname); // Вводим никнейм в поле ввода
    await page.click('#okBtn'); // Нажимаем кнопку "ОК"
    await page.waitForSelector('#modal', { hidden: true }); // Ждем, пока модальное окно исчезнет
    await page.screenshot({ path: 'screenshots/after_registration.png' }); // Скриншот после регистрации
  };
  const sendMessage = async (message) => {
    await page.waitForSelector('#messageInput'); // Ждем, пока поле ввода сообщения станет доступным
    await page.type('#messageInput', message); // Вводим сообщение
    await page.click('#sendBtn'); // Нажимаем кнопку "Отправить"
    await page.screenshot({ path: 'screenshots/after_sending_message.png' }); // Скриншот после отправки сообщения
  };
  test('User registration and message sending', async () => { // Тест на регистрацию пользователя и отправку сообщения
    await page.goto(baseUrl); // Переход на главную страницу чата
    await registerUser('TestUser'); // Регистрация пользователя с никнеймом 'TestUser'
    await sendMessage('Hello, world!'); // Отправка сообщения "Hello, world!"
    
    // Ожидаем, пока сообщение появится в чате
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('.message__container'); // Получаем все сообщения
      return messages.length > 0 && Array.from(messages).some(m => m.textContent.includes('Hello, world!')); // Проверяем, есть ли сообщение
    }, { timeout: 60000 }); // Увеличиваем таймаут до 60 секунд
    const messages = await page.$$('.message__container'); // Получаем все элементы сообщений
    const lastMessageText = await page.evaluate(el => el.textContent, messages[messages.length - 1]); // Получаем текст последнего сообщения
    expect(lastMessageText).toContain('Hello, world!'); // Проверяем, что текст последнего сообщения содержит "Hello, world!"
    await messages[messages.length - 1].screenshot({ path: 'screenshots/last_message.png' }); // Скриншот последнего сообщения
  });
  test('User logout', async () => { // Тест на выход пользователя
    await page.click('#logoutBtn'); // Нажимаем кнопку "Выйти"
    await page.waitForSelector('#modal'); // Ждем, пока модальное окно снова появится
    await page.screenshot({ path: 'screenshots/after_logout.png' }); // Скриншот после выхода
    const nicknameInputVisible = await page.waitForSelector('#nickname', { visible: true }); // Проверка, что поле для ввода никнейма снова доступно
    expect(nicknameInputVisible).toBeTruthy(); // Убеждаемся, что поле для ввода никнейма отображается
  });
  test('User leaves chat', async () => { // Тест на выход пользователя из чата
    await registerUser('AnotherUser'); // Регистрация нового пользователя с никнеймом 'AnotherUser'
    await sendMessage('Goodbye!'); // Отправка сообщения "Goodbye!"
    await page.click('#leaveBtn'); // Нажимаем кнопку "Покинуть чат"
    await page.waitForSelector('#modal'); // Ждем, пока модальное окно снова появится
    await page.screenshot({ path: 'screenshots/after_leaving_chat.png' }); // Скриншот после выхода из чата
    const nicknameInputVisible = await page.waitForSelector('#nickname', { visible: true }); // Проверка, что поле для ввода никнейма снова доступно
    expect(nicknameInputVisible).toBeTruthy(); // Убеждаемся, что поле для ввода никнейма отображается
  });
});
