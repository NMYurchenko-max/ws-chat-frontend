import puppeteer from "puppeteer";
import { fork } from "child_process";
import fs from "fs";
import path from "path";
// Устанавливаем общий таймаут для всех тестов в файле
jest.setTimeout(70000);
describe("Chat E2E Tests", () => {
  let browser;
  let page;
  let serverProcess;
  const baseUrl = "http://localhost:8080"; // URL нашего приложения
  const screenshotsDir = path.resolve(__dirname, "screenshots"); // Папка для скриншотов
  beforeAll(async () => {
    // Запускаем серверное приложение
    serverProcess = fork("e2e/e2e.server.js");
    
    // Создаем директорию для скриншотов, если она не существует
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
    const isCI = process.env.CI === "true"; // Проверяем, запущен ли тест в CI
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
  test('User registration and message sending', async () => {
    await page.goto(baseUrl); // Переход на главную страницу чата
    // Ввод никнейма и регистрация
    await page.waitForSelector('#nickname', { timeout: 60000 });
    await page.type('#nickname', 'TestUser');
    await page.click('#okBtn');
    // Скриншот после успешной регистрации
    await page.waitForSelector('#modal', { hidden: true });
    await page.screenshot({ path: 'screenshots/after_registration.png' });
    // Ввод сообщения и отправка
    await page.waitForSelector('#messageInput');
    await page.type('#messageInput', 'Hello, world!'); // Вводим сообщение
    await page.click('#sendBtn'); // Нажимаем кнопку "Отправить"
    // Ждем, пока новое сообщение появится в чате
    await page.waitForFunction(
      () => {
        const messages = document.querySelectorAll('.message__container');
        return (
          messages.length > 0 &&
          Array.from(messages).some((m) =>
            m.textContent.includes('Hello, world!')
          )
        );
      },
      { timeout: 60000 }
    ); // Увеличиваем таймаут
    // Получаем все сообщения
    const messages = await page.$$('.message__container');
    console.log('Количество сообщений:', messages.length);
    // Логируем количество сообщений
    // Проверяем, что текст сообщения отображается
    const lastMessageText = await page.evaluate(
      (el) => el.textContent,
      messages[messages.length - 1]
    );
    console.log('Текст последнего сообщения:', lastMessageText);
    // Логируем текст сообщения
    expect(lastMessageText).toContain('Hello, world!');
    // Проверяем текст сообщения
    // Скриншот отображения последнего сообщения
    await messages[messages.length - 1].screenshot({
      path: 'screenshots/last_message.png',
    });
  });
  test("User logout", async () => {
    // Выходим из чата
    await page.click("#logoutBtn"); // Нажимаем кнопку "Выйти"
    
    // Ждем, пока модальное окно снова появится
    await page.waitForSelector("#modal");
    
    // Скриншот после выхода из чата
    await page.screenshot({ path: 'screenshots/after_logout.png' });
    
    // Проверка, что пользователь снова может ввести никнейм
    const nicknameInputVisible = await page.waitForSelector("#nickname", { visible: true });
    expect(nicknameInputVisible).toBeTruthy();
  });
  test("User leaves chat", async () => {
    // Снова регистрируемся
    await page.type("#nickname", "AnotherUser");
    // Вводим новый никнейм
    await page.click("#okBtn"); // Нажимаем кнопку "Войти"
    await page.waitForSelector("#modal", { hidden: true });
    // Ждем, пока модальное окно исчезнет
    
    // Ждем, пока появится поле для ввода сообщения
    await page.waitForSelector("#messageInput");
    await page.type("#messageInput", "Goodbye!"); // Вводим сообщение
    await page.click("#sendBtn"); // Нажимаем кнопку "Отправить"
    
    // Нажимаем кнопку "Покинуть чат"
    await page.click("#leaveBtn");
    
    // Ждем, пока модальное окно снова появится
    await page.waitForSelector("#modal");
    
    // Скриншот после покидания чата
    await page.screenshot({ path: 'screenshots/after_leaving_chat.png' });
    
    // Проверка, что пользователь снова может ввести никнейм
    const nicknameInputVisible = await page.waitForSelector("#nickname", { visible: true });
    expect(nicknameInputVisible).toBeTruthy();
  });
});
