import { Game } from "./src/game";
console.log('This is server');

// const TelegramBot = require('node-telegram-bot-api');
import * as TelegramBot from 'node-telegram-bot-api';
const token = process.env.BOT_TOKEN || '312958690:AAHFt5195080aCBqF3P4Hi89ShnfKe862JI';

//括號裡面的內容需要改為在第5步獲得的Token
const bot = new TelegramBot(token, { polling: true });

const game = new Game(bot);

//使用Long Polling的方式與Telegram伺服器建立連線

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, (msg) => {
  game.start();
  // const chatId = msg.chat.id; //用戶的ID
  // const resp = `你好! ${msg.text}`; //括號裡面的為回應內容，可以隨意更改
  //
  // console.log(chatId, msg);
  //
  // bot.sendMessage(chatId, resp); //發送訊息的function
});

bot.onText(/\/show/, (msg, match) => {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Some button text 1', callback_data: '1' }],
        [{ text: 'Some button text 2', callback_data: '2' }],
        [{ text: 'Some button text 3', callback_data: '3' }]
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Some text giving three inline buttons', options)
    .then((sended) => {
      // `sended` is the sent message.
      console.log('sended', sended);
    });
});

// Inline button callback queries
bot.on('callback_query', (msg) => {
  console.log(msg); // msg.data refers to the callback_data
  bot.answerCallbackQuery(msg.id, 'Ok, here ya go!');
});

//收到/cal開頭的訊息時會觸發這段程式
bot.onText(/\/cal (.+)/, (msg, match) => {
  const fromId = msg.from.id; //用戶的ID
  let resp = match[1].replace(/[^-()\d/*+.]/g, '');

  console.log(fromId + ":" + resp);

  // match[1]的意思是 /cal 後面的所有內容
  resp = '計算結果為: ' + eval(resp);
  // eval是用作執行計算的function
  bot.sendMessage(fromId, resp); //發送訊息的function
});

bot.onText(/(.+)/, (msg, match) => {
  const fromId = msg.from.id; //用戶的ID	
  console.log(fromId + ":" + match[1]);
  bot.sendMessage(fromId, match[1]); //發送訊息的function
});

bot.on("inline_query", (query) => {
  bot.answerInlineQuery(query.id, [
    {
      type: "article",
      id: "testarticle",
      title: "Hello world",
      input_message_content: {
        message_text: "Hello, world! This was sent from my super cool inline bot."
      }
    }
  ]);
});