import * as _ from 'lodash';
import * as TelegramBot from 'node-telegram-bot-api';
import * as Emoji from 'node-emoji';
import { Game } from './src/game';
import { Role } from "./src/role/role";
import { Player } from "./src/player/player";

let gameId = 0;
const games = [];
const token = process.env.BOT_TOKEN || '312958690:AAHFt5195080aCBqF3P4Hi89ShnfKe862JI';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/newgame/, (msg) => {
  // make sure single game first, avoid bug at this moment
  if (games.length > 0) {
    bot.sendMessage(msg.chat.id, `${Emoji.get('no_entry_sign')}  Sorry. There is another game has been started`);
    return;
  }

  console.log('msg', msg);

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

  const players: Player[] = [
    new Player({ id: msg.from.id, name: msg.from.first_name }),
    new Player({ id: 2, name: 'Player2' }),
    new Player({ id: 3, name: 'Player3' }),
    new Player({ id: 4, name: 'Player4' }),
    new Player({ id: 5, name: 'Player5' }),
    new Player({ id: 6, name: 'Player6' })
  ];

  games.push(new Game(gameId, bot, players, roles));
  console.log(`GAME ${gameId} has been created`);
  gameId++;
});

bot.onText(/\/join/, (msg) => {
  const game = _.find(games, (g) => g.id === 0);
  const player = new Player({
    id: msg.from.id,
    name: msg.from.first_name
  });
  game.addPlayer(player);
});

bot.onText(/\/start/, (msg) => {
  const game = _.find(games, (g) => g.id === 0);

  if (!game) {
    bot.sendMessage(msg.chat.id, `${Emoji.get('bomb')}  Sorry. Please create a new game (/newgame)`);
    return;
  }

  game.start(msg)
    .then(() => {
      console.log('Kill Game', game.id);
      _.remove(this.games, (g: Game) => g.id === game.id);
    })
    .catch((error) => {
      console.log(`Error ${error}`);
      bot.sendMessage(msg.chat.id, `${Emoji.get('bomb')}  Error: ${error}.`);
    });
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