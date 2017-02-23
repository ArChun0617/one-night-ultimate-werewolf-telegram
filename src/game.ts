import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";

export class Game {
  id: number;
  players: any[];
  table: Table = new Table();
  bot: any;
  deck: Deck;
  gameRoles: string[];
  gameTime: number = 600000;

  constructor(id: number, bot: any, players: Player[], roles: string[]) {
    this.id = id;
    this.bot = bot;
    this.gameRoles = roles;
    this.players = players;
  }

  start(msg) {
    this.bot.sendMessage(msg.chat.id, `${Emoji.get('game_die')}  Game start`);

    this.prepareDeck()
      .then(() => this.announcePlayerRole(msg))
      .then(() => this.startNight(msg))
      .then(() => {
        console.log('[Deck]', this.deck);
        console.log('[Table]', this.table);
        console.log('[Players]', this.players);
      })
      .then(() => {
        console.log('send start msg');
        this.bot.sendMessage(
          msg.chat.id,
          `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you have 10mins to discuss ...`
        );
      })
      .then(() => {
        console.log('Game conversation counter');
        setTimeout(() => {
          this.beginVoting();
        }, this.gameTime);
      })
      .catch(err => console.log(err));
  }

  private prepareDeck() {
    return new Promise((resolve, reject) => {
      this.deck = DeckFactory.generate(this.gameRoles);

      // assign role
      _.map(this.players, (player) => {
        player.setRole(this.deck.getRoles().shift());
      });

      // set the table cards
      this.table.setRoles(this.deck.getRoles());

      if (this.deck.getRoles().length !== 0) {
        reject('Role card does not distribute correctly');
      }

      resolve();
    });
  }

  private announcePlayerRole(msg) {
    console.log('announcePlayerRole');
    return new Promise((resolve, reject) => {
      this.bot.sendMessage(
        msg.chat.id,
        `${Emoji.get('eyeglasses')}  Everyone, please check your role`,
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: 'VIEW', callback_data: 'view_role' }]
            ]
          })
        }
      );

      this.bot.on('callback_query', (msg) => {
        console.log('Callback_query Called', msg);
        if (msg.data === 'view_role') {
          const player = _.find(this.players, (player) => player.id == 1);
          this.bot.answerCallbackQuery(msg.id, `Your role is ${player.getOriginalRole().name}`);
        }
      });

      setTimeout(() => resolve(), 10000);
    });
  }

  private startNight(msg) {
    this.bot.sendMessage(msg.chat.id, `${Emoji.get('crescent_moon')}  Night start, Everyone close your eye.`);
    return this.wakeUp(Role.DOPPELGANGER, msg)
      .then(() => this.wakeUp(Role.WEREWOLF, msg))
      .then(() => this.wakeUp(Role.MINION, msg))
      .then(() => this.wakeUp(Role.MASON, msg))
      .then(() => this.wakeUp(Role.SEER, msg))
      .then(() => this.wakeUp(Role.ROBBER, msg))
      .then(() => this.wakeUp(Role.TROUBLEMAKER, msg))
      .then(() => this.wakeUp(Role.DRUNK, msg))
      .then(() => this.wakeUp(Role.INSOMNIAC, msg));
  }

  private wakeUp(currentRole, msg): Promise<any> {
    if (!this.isExistInCurrentGame(currentRole)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const player = _.find(this.players, (player) => player.getOriginalRole().name === currentRole);

      if (player) {
        player.getOriginalRole().wakeUp(this.bot, msg, this.players, this.table);
      } else {
        const npc = _.find(this.table.getRoles(), (role: Role) => role.name === currentRole);
        npc.wakeUp(this.bot, msg, this.players, this.table);
      }

      setTimeout(() => resolve(), 1000);
    });
  }

  private beginVoting() {
    console.log('Begin vote');
  }

  private isExistInCurrentGame(role) {
    return _.indexOf(this.gameRoles, role) >= 0;
  }
}