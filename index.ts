import * as _ from 'lodash';
import * as TelegramBot from 'node-telegram-bot-api';
import * as Emoji from 'node-emoji';
import { Game } from './src/game';
import { Role } from "./src/role/role";
import { Player } from "./src/player/player";

interface GameSetting {
  id: string;
  roles: string[];
}

const gameSettings: GameSetting[] = [];
const games = [];
const token = process.env.BOT_TOKEN || '312958690:AAHFt5195080aCBqF3P4Hi89ShnfKe862JI';
const bot = new TelegramBot(token, { polling: true });
const roles = [
  // { name: Role.DOPPELGANGER, max: 1 },
  { name: Role.WEREWOLF, max: 2 },
  { name: Role.MINION, max: 1 },
  { name: Role.MASON, max: 2 },
  { name: Role.SEER, max: 1 },
  { name: Role.ROBBER, max: 1 },
  { name: Role.TROUBLEMAKER, max: 1 },
  { name: Role.DRUNK, max: 1 },
  { name: Role.INSOMNIAC, max: 1 },
  { name: Role.VILLAGER, max: 3 },
  { name: Role.HUNTER, max: 1 },
  { name: Role.TANNER, max: 1 }
];

bot.onText(/\/setting/, (msg) => {
  const btnPerLine = 3;
  const key = [];
  let pos = 0;

  const gameSetting = _.find(gameSettings, setting => setting.id === msg.chat.id);
  if (gameSetting) {
    gameSetting.roles = []; 
  } else {
    gameSettings.push({ id: msg.chat.id, roles: []});
  }

  _.map(roles, (role) => {
    let row = pos / btnPerLine | 0;
    if (!key[row]) key[row] = [];
    key[row].push({ text: role.name, callback_data: `SET_ROLE_${role.name}` });
    pos++;
  });

  bot.sendMessage(
    msg.chat.id,
    `${Emoji.get('gear')}  Please click to add roles`,
    {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    }
  );
});

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

  const gameSetting = _.find(gameSettings, setting => setting.id === msg.chat.id);
  
  if (!gameSetting) {
    bot.sendMessage(msg.chat.id,
      `${Emoji.get('no_entry_sign')}  Sorry. Please set the game setting before making a new game`
    );
    return;
  }

  const players: Player[] = [
    new Player({ id: msg.from.id, name: msg.from.first_name })
  ];

  games.push(new Game(id, bot, players, gameSetting.roles));
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
  const gameSetting = _.find(gameSettings, setting => setting.id === msg.chat.id);
  const game = getGame(msg.chat.id);

  if (!game) return askForCreateNewGame(msg.chat.id);
  if (!gameSetting) {
    bot.sendMessage(msg.message.chat.id, `${Emoji.get('no_entry_sign')}  Sorry. Please run /setting first`);

    return;
  }

  // TODO: hardcode to add dummy players
  if (game.players.length < gameSetting.roles.length)
    for(let i = game.players.length; i < gameSetting.roles.length; i++)
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
  const gameSetting = _.find(gameSettings, setting => setting.id === msg.message.chat.id);
  
  if (!gameSetting) {
    bot.sendMessage(msg.message.chat.id, `${Emoji.get('no_entry_sign')}  Sorry. Please run /setting first`);

    return;
  }

  const regex = new RegExp(/^SET_ROLE_(.+?)/);

  if (regex.test(msg.data)) {
    // game setting - set role
    switch (msg.data) {
      case `SET_ROLE_${Role.WEREWOLF}`: addGameSettingRole(msg.id, gameSetting, Role.WEREWOLF); break;
      case `SET_ROLE_${Role.MINION}`: addGameSettingRole(msg.id, gameSetting, Role.MINION); break;
      case `SET_ROLE_${Role.MASON}`: addGameSettingRole(msg.id, gameSetting, Role.MASON); break;
      case `SET_ROLE_${Role.SEER}`: addGameSettingRole(msg.id, gameSetting, Role.SEER); break;
      case `SET_ROLE_${Role.ROBBER}`: addGameSettingRole(msg.id, gameSetting, Role.ROBBER); break;
      case `SET_ROLE_${Role.TROUBLEMAKER}`: addGameSettingRole(msg.id, gameSetting, Role.TROUBLEMAKER); break;
      case `SET_ROLE_${Role.DRUNK}`: addGameSettingRole(msg.id, gameSetting, Role.DRUNK); break;
      case `SET_ROLE_${Role.INSOMNIAC}`: addGameSettingRole(msg.id, gameSetting, Role.INSOMNIAC); break;
      case `SET_ROLE_${Role.VILLAGER}`: addGameSettingRole(msg.id, gameSetting, Role.VILLAGER); break;
      case `SET_ROLE_${Role.HUNTER}`: addGameSettingRole(msg.id, gameSetting, Role.HUNTER); break;
      case `SET_ROLE_${Role.TANNER}`: addGameSettingRole(msg.id, gameSetting, Role.TANNER); break;
    }

    return;
  }

  // find the user and callback the Game on handler
  const game = getGame(msg.message.chat.id);
  if (!game) return askForCreateNewGame(msg.message.chat.id);

  // Game event
  game.on(msg.data, msg);
});

function addGameSettingRole(msgId: number, gameSetting: any, role: string) {
  const roleSetting = _.find(roles, r => r.name === role);
  if (_.filter(gameSetting.roles, (r) => r === role).length < roleSetting.max) {
    gameSetting.roles.push(role);
    bot.answerCallbackQuery(msgId, `${Emoji.get('white_check_mark')}  Added ${role}`);
  } else {
    bot.answerCallbackQuery(msgId, `${Emoji.get('no_entry_sign')}  Too many ${role}`);
  }

}

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
