import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role } from './role/role';
import { Werewolf } from "./role/werewolf";
import { Doppelganger } from "./role/doppelganger";
import { Minion } from "./role/minion";
import { Mason } from "./role/mason";
import { Seer } from "./role/seer";
import { Robber } from "./role/robber";
import { Troublemaker } from "./role/troublemaker";
import { Drunk } from "./role/drunk";
import { Insomniac } from "./role/insomniac";
import { Villager } from "./role/villager";
import { Tanner } from "./role/tanner";
import { Hunter } from "./role/hunter";

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

    // settle role and init role object
    // create user role and set the player id
    const options = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Candy' },
      { id: 4, name: 'Davis' },
      { id: 5, name: 'Ethan' },
      { id: 6, name: 'Fred' },
    ];

    let i = 0;

    _.map(roles, (role) => {
      const option = options[i];

      switch (role) {
        case Role.DOPPELGANGER:
          this.players.push(new Doppelganger(option));
          break;
        case Role.WEREWOLF:
          this.players.push(new Werewolf(option));
          break;
        case Role.MINION:
          this.players.push(new Minion(option));
          break;
        case Role.MASON:
          this.players.push(new Mason(option));
          break;
        case Role.SEER:
          this.players.push(new Seer(option));
          break;
        case Role.ROBBER:
          this.players.push(new Robber(option));
          break;
        case Role.TROUBLEMAKER:
          this.players.push(new Troublemaker(option));
          break;
        case Role.DRUNK:
          this.players.push(new Drunk(option));
          break;
        case Role.INSOMNIAC:
          this.players.push(new Insomniac(option));
          break;
        case Role.VILLAGER:
          this.players.push(new Villager(option));
          break;
        case Role.TANNER:
          this.players.push(new Tanner(option));
          break;
        case Role.HUNTER:
          this.players.push(new Hunter(option));
          break;
        default:
          return;
      }

      i++;
    });

    // notify the user their role
    
    // night event
  }
}