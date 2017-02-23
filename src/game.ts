import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";

export class Game {
  users: any[];
  players: any[];
  table: Table;
  bot: any;
  deck: Deck;
  nightSequence: string[] = [
    Role.DOPPELGANGER,
    Role.WEREWOLF,
    Role.MINION,
    Role.MASON,
    Role.SEER,
    Role.ROBBER,
    Role.TROUBLEMAKER,
    Role.DRUNK,
    Role.INSOMNIAC
  ];

  constructor(bot: any) {
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
    const gameRoles = [
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
    if (this.users.length + 3 !== gameRoles.length) {
      this.bot.sendMessage(
        msg.chat.id,
        `${Emoji.get('bomb')}  Error: Number of players and roles doesn't match.`
      );
    }

    // create a new deck
    this.deck = DeckFactory.generate(gameRoles);

    // assign role
    let roles = _.clone(this.deck.getRoles());
    _.map(this.users, (user) => {
      const player = new Player(user);
      this.players.push(player.setRole(roles.shift()));
    });

    if (roles.length !== 3) {
      throw new Error('There should be three cards remain on table');
    }

    // set the table cards
    this.table.setRoles(_.clone(roles));


    // notify the user their role
    
    // night event
    console.log('[Deck]', this.deck);
    console.log('[Table]', this.table);
    console.log('[Players]', this.players);
  }
}