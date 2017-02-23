import * as _ from 'lodash';
import * as TelegramBot from 'node-telegram-bot-api';
import { Game } from './src/game';
import { Emoji } from 'node-emoji';
import { Role } from "./src/role/role";
import { Player } from "./src/player/player";

let gameId = 0;
const games = [];
const token = process.env.BOT_TOKEN || '312958690:AAHFt5195080aCBqF3P4Hi89ShnfKe862JI';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  // make sure single game first, avoid bug at this moment
  if (games.length > 0) {
    bot.sendMessage(msg.chat.id, `${Emoji.get('no_entry_sign')}  Sorry. There is another game has been started`);
    return;
  }

  console.log('msg', msg);

  // temp dummy for game user
  const users = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Candy' },
    { id: 4, name: 'Davis' },
    { id: 5, name: 'Ethan' },
    { id: 6, name: 'Fred' },
  ];

  // TODO: stage II
  // ask for number of players
  // ask for roles
  // roles count is three more than players number
  const roles = [
    Role.WEREWOLF,
    Role.WEREWOLF,
    Role.MINION,
    Role.SEER,
    Role.ROBBER,
    Role.TROUBLEMAKER,
    Role.INSOMNIAC,
    Role.DRUNK,
    Role.TANNER
  ];

  const players = [];

  _.map(users, (user) => {
    players.push(new Player(user));
  });

  if (users.length + 3 !== roles.length) {
    bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('bomb')}  Error: Number of players and roles doesn't match.`
    );
    return;
  }

  const game = new Game(gameId, bot, players, roles);
  gameId++;
  game.start(msg)
    .then(() => {
      console.log('Kill Game', game.id);
      _.remove(this.games, (g: Game) => g.id === game.id);
    });
});

bot.onText(/\/join/, (msg) => {

});

console.log('Server is on ...');

// bot.onText(/\/show/, (msg, match) => {
//   const options = {
//     reply_markup: JSON.stringify({
//       inline_keyboard: [
//         [{ text: 'Some button text 1', callback_data: '1' }],
//         [{ text: 'Some button text 2', callback_data: '2' }],
//         [{ text: 'Some button text 3', callback_data: '3' }]
//       ]
//     })
//   };
//   bot.sendMessage(msg.chat.id, 'Some text giving three inline buttons', options)
//     .then((sended) => {
//       // `sended` is the sent message.
//       console.log('sended', sended);
//     });
// });

// Inline button callback queries
// bot.on('callback_query', (msg) => {
//   console.log(msg); // msg.data refers to the callback_data
//   bot.answerCallbackQuery(msg.id, 'Ok, here ya go!');
// });

//收到/cal開頭的訊息時會觸發這段程式
// bot.onText(/\/cal (.+)/, (msg, match) => {
//   const fromId = msg.from.id; //用戶的ID
//   let resp = match[1].replace(/[^-()\d/*+.]/g, '');
//
//   console.log(fromId + ":" + resp);
//
//   // match[1]的意思是 /cal 後面的所有內容
//   resp = '計算結果為: ' + eval(resp);
//   // eval是用作執行計算的function
//   bot.sendMessage(fromId, resp); //發送訊息的function
// });

// bot.onText(/(.+)/, (msg, match) => {
//   const fromId = msg.from.id; //用戶的ID	
//   console.log(fromId + ":" + match[1]);
//   bot.sendMessage(fromId, match[1]); //發送訊息的function
// });

// bot.on("inline_query", (query) => {
//   bot.answerInlineQuery(query.id, [
//     {
//       type: "article",
//       id: "testarticle",
//       title: "Hello world",
//       input_message_content: {
//         message_text: "Hello, world! This was sent from my super cool inline bot."
//       }
//     }
//   ]);
// });