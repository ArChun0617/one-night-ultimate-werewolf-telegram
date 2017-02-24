import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";

export class Game {
  public static STATUS_WAITING_PLAYER:string = 'waiting';
  public static STATUS_START_GAME:string = 'startgame';
  public static STATUS_PREPARE_DECK:string = 'prepare_deck';
  public static STATUS_ANNOUNCE_PLAYER_ROLE:string = 'announce_player_role';
  public static STATUS_START_NIGHT:string = 'start_night';
  public static STATUS_WAKEUP_DOPPELGANGER:string = 'wakeup_doppelganger';
  public static STATUS_WAKEUP_WEREWOLF:string = 'wakeup_werewolf';
  public static STATUS_WAKEUP_MINION:string = 'wakeup_minion';
  public static STATUS_WAKEUP_MASON:string = 'wakeup_mason';
  public static STATUS_WAKEUP_SEER:string = 'wakeup_seer';
  public static STATUS_WAKEUP_ROBBER:string = 'wakeup_robber';
  public static STATUS_WAKEUP_TROUBLEMAKER:string = 'wakeup_troublemaker';
  public static STATUS_WAKEUP_DRUNK:string = 'wakeup_drunk';
  public static STATUS_WAKEUP_INSOMNIAC:string = 'wakeup_insomniac';
  public static STATUS_CONVERSATION:string = 'conversation';
  public static STATUS_VOTING:string = 'voting';
  public static STATUS_KILL_PLAYER:string = 'kill_player';
  public static STATUS_END_GAME:string = 'endgame';

  id: number;
  players: any[];
  table: Table = new Table();
  bot: any;
  deck: Deck;
  gameRoles: string[];
  gameTime: number = 600000;
  status: string = Game.STATUS_WAITING_PLAYER;

  constructor(id: number, bot: any, players: Player[], roles: string[]) {
    this.id = id;
    this.bot = bot;
    this.gameRoles = roles;
    this.players = players;
  }

  start(msg) {
    this.setStatus(Game.STATUS_START_GAME);
    console.log(`Game started: ${this.id}`);

    this.bot.sendMessage(msg.chat.id, `${Emoji.get('game_die')}  Game start`);

    if (this.players.length + 3 !== this.gameRoles.length) {
      return Promise.reject('Number of players and roles doesn\'t match');
    }

    return this.prepareDeck()
      .then(() => console.log(`Announce player role`))
      .then(() => this.announcePlayerRole(msg))
      .then(() => console.log(`Start night`))
      .then(() => this.startNight(msg))
      .then(() => {
        // debug
        console.log('[Deck]', this.deck);
        console.log('[Table]', this.table);
        console.log('[Players]', this.players);
      })
      .then(() => console.log(`Start conversation`))
      .then(() => this.startConversation(msg))
      .then(() => console.log(`Begin voting`))
      .then(() => this.beginVoting())
      .then(() => console.log(`Kill player`))
      .then(() => this.killPlayer())
      .then(() => console.log(`Show result`))
      .then(() => this.showResult())
      .catch(err => console.log(err));
  }

  isStarted() {
    return !(this.getStatus() === Game.STATUS_WAITING_PLAYER);
  }

  getStatus(): string {
    return this.status;
  }

  addPlayer(player: Player) {
    if (!this.getPlayer(player.id)) {
      this.players.push(player);
    }
	console.log(this.players);
  }

  getPlayer(id: number) {
    return _.find(this.players, player => player.id === id);
  }

  on(event, msg) {
    // status validation
    if (_.indexOf([Game.STATUS_WAITING_PLAYER, Game.STATUS_KILL_PLAYER, Game.STATUS_END_GAME], this.getStatus()) >= 0) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    const player = this.getPlayer(msg.from.id);
    console.log(`Callback_query Called [Game]: ${this.id} | [Event]: ${event} | [Player] ${player ? player.name : 'Nan'}`);

    if (!player) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    switch (event) {
      case 'view_role': this.viewPlayerRole(player, msg); break;
	    default: player.originalRole.callbackAbility(this.bot, msg, this.players); break;
    }
  }

  private prepareDeck() {
    this.setStatus(Game.STATUS_PREPARE_DECK);

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
    this.setStatus(Game.STATUS_ANNOUNCE_PLAYER_ROLE);

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

      setTimeout(() => resolve(), 10000);
    });
  }

  private startNight(msg) {
    this.setStatus(Game.STATUS_START_NIGHT);
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

  private wakeUp(role, msg): Promise<any> {
    if (!this.isExistInCurrentGame(role)) return Promise.resolve();

    this.setWakeUpStatus(role);

    return new Promise((resolve, reject) => {
      const player = _.find(this.players, (player) => player.getOriginalRole().name === role);

      if (player) {
        player.getOriginalRole().wakeUp(this.bot, msg, this.players, this.table);
      } else {
        const npc = _.find(this.table.getRoles(), (r: Role) => r.name === role);
        npc.wakeUp(this.bot, msg, this.players, this.table);
      }

      setTimeout(() => resolve(), 1000);
    });
  }

  private startConversation(msg) {
    this.setStatus(Game.STATUS_CONVERSATION);

    this.bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you have 10mins to discuss ...`
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), this.gameTime);
    });
  }

  private beginVoting() {
    this.setStatus(Game.STATUS_VOTING);
    // TODO: ...
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  private killPlayer() {
    this.setStatus(Game.STATUS_KILL_PLAYER);
    // TODO: ...
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  private showResult() {
    this.setStatus(Game.STATUS_END_GAME);
    // TODO: ...
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  private isExistInCurrentGame(role) {
    return _.indexOf(this.gameRoles, role) >= 0;
  }

  private setStatus(status: string) {
    this.status = status;
  }

  private setWakeUpStatus(role) {
    switch (role) {
      case Role.DOPPELGANGER:
        this.setStatus(Game.STATUS_WAKEUP_DOPPELGANGER);
        break;
      case Role.WEREWOLF:
        this.setStatus(Game.STATUS_WAKEUP_WEREWOLF);
        break;
      case Role.MINION:
        this.setStatus(Game.STATUS_WAKEUP_MINION);
        break;
      case Role.MASON:
        this.setStatus(Game.STATUS_WAKEUP_MASON);
        break;
      case Role.SEER:
        this.setStatus(Game.STATUS_WAKEUP_SEER);
        break;
      case Role.ROBBER:
        this.setStatus(Game.STATUS_WAKEUP_ROBBER);
        break;
      case Role.TROUBLEMAKER:
        this.setStatus(Game.STATUS_WAKEUP_TROUBLEMAKER);
        break;
      case Role.DRUNK:
        this.setStatus(Game.STATUS_WAKEUP_DRUNK);
        break;
      case Role.INSOMNIAC:
        this.setStatus(Game.STATUS_WAKEUP_INSOMNIAC);
        break;
    }
  }

  private sendInvalidActionMessage(msgId) {
    return this.bot.answerCallbackQuery(msgId, `${Emoji.get('middle_finger')}  Hey! Stop doing that!`);
  }
  
  private viewPlayerRole(player, msg) {
    player.getRole().notifyRole(this.bot, msg);
  }
}