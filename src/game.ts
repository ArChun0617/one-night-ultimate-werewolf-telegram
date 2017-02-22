import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role } from './role/role';
import { Werewolf } from "./role/werewolf";

export class Game {
  players: any[];
  bot: any;

  constructor(bot: any) {
    // TODO: init the game here
    this.players = [];
    this.bot = bot;
  }

  start() {
    console.log(`${Emoji.get('game_die')}  Game start`);

    // TODO: stage II
    // ask for number of players
    // ask for roles
    const roles = [
      'werewolf',
      'minion',
      'seer',
      'robber',
      'troublemaker',
      'tanner'
    ];

    // init the game
    // create user role and set the player id
    _.map(roles, (role) => {
      switch (role) {
        case 'werewolf':
          this.players.push(new Werewolf({ id: 1 }));
          break;
        default:
          return;
      }
    });

    // main game
    // night event
  }
}