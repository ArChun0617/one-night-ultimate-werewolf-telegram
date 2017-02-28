import * as _ from 'lodash';
import * as TelegramBot from 'node-telegram-bot-api';
import * as Emoji from 'node-emoji';
import { Game } from './src/game';
import { Role } from "./src/role/role";
import { Player } from "./src/player/player";

const games = [];
const token = process.env.BOT_TOKEN || '312958690:AAHFt5195080aCBqF3P4Hi89ShnfKe862JI';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/newgame/, (msg) => {
  const id = msg.chat.id;
  // validation and make sure one channel only have one game
  if (_.find(games, (g) => g.id === id)) {
    bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('no_entry_sign')}  Sorry. There is a game start in this channel, please move there and try \/join to join game`
    );
    return;
  }

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
    new Player({ id: msg.from.id, name: msg.from.first_name })
  ];

  games.push(new Game(id, bot, players, roles));
  bot.sendMessage(msg.chat.id, `${Emoji.get('star')}  Created a new game, please enter \/join to join this game`);
  console.log(`GAME ${id} has been created`);
});

bot.onText(/\/join/, (msg) => {
  const game = getGame(msg.chat.id);

  if (!game) return askForCreateNewGame(msg.chat.id);

  // validation game isStarted
  if (game.isStarted()) return bot.sendMessage(
    msg.chat.id,
    `${Emoji.get('no_entry_sign')}  Sorry. The game has been started, please wait until next game`
  );

  const player = new Player({
    id: msg.from.id,
    name: msg.from.first_name
  });

  game.addPlayer(msg, player);
});

bot.onText(/\/start/, (msg) => {
  const game = getGame(msg.chat.id);

  if (!game) return askForCreateNewGame(msg.chat.id);

  // TODO: hardcode to add dummy players
  if (game.players.length < 6)
    for(let i = game.players.length; i < 6; i++)
      game.players.push(new Player({ id: i, name: 'Player'+i }));

  game.start(msg)
    .then(() => {
      console.log('Kill Game', msg.chat.id);
      killGame(msg.chat.id);
    })
    .catch((error) => {
      console.log(`Error ${error}`);
      bot.sendMessage(msg.chat.id, `${Emoji.get('bomb')}  Error: ${error}.`);
    });
});

bot.onText(/\/killgame/, (msg) => {
  killGame(msg.chat.id);
});

bot.onText(/\/vote/, (msg) => {
  const game = _.find(games, (g) => g.id === msg.chat.id);

  if (!game) return askForCreateNewGame(msg.chat.id);

  game.sendVotingList(msg.chat.id);
});

bot.on('callback_query', (msg) => {
  // find the user and callback the Game on handler
  const game = getGame(msg.message.chat.id);

  if (!game) return askForCreateNewGame(msg.message.chat.id);

  game.on(msg.data, msg);
});

bot.onText(/\/show/, (msg, match) => {
  const game = getGame(msg.chat.id);

  if (!game) return askForCreateNewGame(msg.chat.id);

  game.show();
});

function killGame(id: number) {
  _.remove(games, (game: Game) => game.id === id);
}

function getGame(id: number) {
  return _.find(games, (game) => game.id === id);
}

function askForCreateNewGame(msgId: number) {
  return bot.sendMessage(msgId, `${Emoji.get('bomb')}  Sorry. Please create a new game (/newgame)`);
}

console.log(`${Emoji.get('robot_face')}  Hi! I am up`);
