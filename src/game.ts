import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";

export class Game {
  id: number;
  users: any[];
  players: any[];
  table: Table;
  bot: any;
  deck: Deck;
  gameRoles: string[];

  constructor(id: number, bot: any) {
    this.id = id;
    this.table = new Table();
    this.players = [];
    this.bot = bot;

    // temp dummy for game user
    this.users = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Candy' },
      { id: 4, name: 'Davis' },
      { id: 5, name: 'Ethan' },
      { id: 6, name: 'Fred' },
    ];
  }

  start(msg) {
    this.bot.sendMessage(msg.chat.id, `${Emoji.get('game_die')}  Game start`);

    // TODO: stage II
    // ask for number of players
    // ask for roles
    // roles count is three more than players number
    this.gameRoles = [
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

    // 
    if (this.users.length + 3 !== this.gameRoles.length) {
      this.bot.sendMessage(
        msg.chat.id,
        `${Emoji.get('bomb')}  Error: Number of players and roles doesn't match.`
      );
    }

    // create a new deck
    this.deck = DeckFactory.generate(this.gameRoles);

    // assign role
    _.map(this.users, (user) => {
      const player = new Player(user);
      player.setRole(this.deck.getRoles().shift());
      this.players.push(player);
    });

    // set the table cards
    this.table.setRoles(this.deck.getRoles());

    if (this.deck.getRoles().length !== 0) {
      throw new Error('Role card does not distribute correctly');
    }

    // notify the user their role

    // night event
    console.log('[Deck]', this.deck);
    console.log('[Table]', this.table);
    console.log('[Players]', this.players);

    this.wakeUp(Role.DOPPELGANGER, msg)
      .then(() => this.wakeUp(Role.WEREWOLF, msg))
      .then(() => this.wakeUp(Role.MINION, msg))
      .then(() => this.wakeUp(Role.MASON, msg))
      .then(() => this.wakeUp(Role.SEER, msg))
      .then(() => this.wakeUp(Role.ROBBER, msg))
      .then(() => this.wakeUp(Role.TROUBLEMAKER, msg))
      .then(() => this.wakeUp(Role.DRUNK, msg))
      .then(() => this.wakeUp(Role.INSOMNIAC, msg))
      .then(() => this.bot.sendMessage(
        msg.chat.id,
        `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you have 10mins to discuss ...`
      ));
  }

  wakeUp(currentRole, msg): Promise<any> {
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

      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  isExistInCurrentGame(role) {
    return _.indexOf(this.gameRoles, role) >= 0;
  }
}