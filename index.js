/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(
      chatId,
      'Welcome to the bot!\n Please Fill the Form to get 10% discount on your first order.',
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Fill the Form',
                web_app: { url: WEB_APP_URL + '/form' },
              },
            ],
          ],
        },
      },
    );
  }

  await bot.sendMessage(chatId, 'Go to the web app to create an order.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Create Order', web_app: { url: WEB_APP_URL } }],
      ],
    },
  });

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      console.log('🚀 ~ file: index.js:48 ~ bot.on ~ data:', data);

      await bot.sendMessage(chatId, 'Hello ' + data.name + '👋');
      await bot.sendMessage(chatId, 'Nice to meet you!');

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Here is your discount code: 10%OFF');
      }, 3000);
    } catch (error) {}
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      id: queryId,
      type: 'article',
      title: 'Order created!',
      input_message_content: {
        message_text: `
        Congratulations 🎉🎉🎉
        Your order has been created successfully.
        Total Price: ${totalPrice}$
      `,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      id: queryId,
      type: 'article',
      title: 'Order is not created',
      input_message_content: {
        message_text: 'Order is not created. Please try again.',
      },
    });

    return res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
