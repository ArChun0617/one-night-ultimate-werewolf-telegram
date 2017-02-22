import * as Emoji from 'node-emoji';
import { ShufflePhase } from "./phase/shufflePhase";

export class Game {
  users: any[];
  players: any[];
  bot: any;

  constructor(bot: any) {
    // TODO: init the game here
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
    this.players = ShufflePhase.assignRoles(this.users, roles);

    // notify the user their role
    
    // night event
    console.log('this.players', this.players);
  }
}