import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";

interface Result {
  target: Player;
  count: number;
}

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
  gameTime: number = process.env.GAME_TIME || 10 * 60 * 1000;
  actionTime: number = process.env.ACTION_TIME || 10 * 1000;
  btnPerLine: number = process.env.BTN_PER_LINE || 3;
  status: string = Game.STATUS_WAITING_PLAYER;
  result: Result[] = [];
  deathPlayers: Player[] = [];
  winners: Player[] = [];
  losers: Player[] = [];

  constructor(id: number, bot: any, players: Player[], roles: string[]) {
    this.id = id;
    this.bot = bot;
    this.gameRoles = roles;
    this.players = players;
  }
  
  show() {
	console.log('[Table]', this.table);
	console.log('[Players]', this.players);
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
      .then(() => this.beginVoting(msg))
      .then(() => console.log(`Kill player`))
      .then(() => this.killPlayer())
      .then(() => console.log(`Show result`))
      .then(() => this.showResult(msg))
      .catch(err => console.log(err));
  }

  isStarted() {
    return !(this.getStatus() === Game.STATUS_WAITING_PLAYER);
  }

  getStatus(): string {
    return this.status;
  }

  addPlayer(msg, player: Player) {
    if (!this.getPlayer(player.id)) {
      this.players.push(player);
    }
	
    let rtnMsg: string = "";
    _.map(this.players, (player: Player) => {
		rtnMsg += player.name + "\n";
    });
	
    this.bot.sendMessage(msg.chat.id, "Player joined: " + rtnMsg);
	console.log(this.players);
  }

  getPlayer(id: number) {
    return _.find(this.players, player => player.id === id);
  }

  on(event, msg) {
    // status validation
    if (_.indexOf([
        Game.STATUS_WAITING_PLAYER,
        Game.STATUS_START_GAME,
        Game.STATUS_PREPARE_DECK,
        Game.STATUS_START_NIGHT,
        Game.STATUS_KILL_PLAYER,
        Game.STATUS_END_GAME
      ], this.getStatus()) >= 0) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    const player = this.getPlayer(msg.from.id);
    console.log(`Callback_query Called [Game]: ${this.id} | [Event]: ${event} | [Player] ${player ? player.name + "(" + player.getRole().name + ")" : 'Nan'}`);

    if (!player) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    switch (this.getStatus()) {
      case Game.STATUS_ANNOUNCE_PLAYER_ROLE: this.handleAnnouncePlayerEvent(event, msg, player); break;
      case Game.STATUS_CONVERSATION: this.handleConversationEvent(event, msg, player); break;
      case Game.STATUS_VOTING: this.handleVotingEvent(event, msg, player); break;
      default: this.handleWakeUpEvent(event, msg, player); break;
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
              [{ text: 'View your role', callback_data: 'view_role' }]
            ]
          })
        }
      );

      setTimeout(() => resolve(), this.actionTime);
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
      const player = _.find(this.players, (p) => p.getOriginalRole().name === role);

      if (player) {
        player.getOriginalRole().wakeUp(this.bot, msg, this.players, this.table);
      } else {
        const npc = _.find(this.table.getRoles(), (r: Role) => r.name === role);
        npc.wakeUp(this.bot, msg, this.players, this.table);
      }

      setTimeout(() => resolve(), this.actionTime);
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

  private beginVoting(msg: any) {
    this.setStatus(Game.STATUS_VOTING);

    return new Promise((resolve, reject) => {
      const key = [];
      let pos = 0;

      _.map(this.players, (player: Player) => {
        if (player.id === msg.from.id) return;	// skip himself

        let row = pos / this.btnPerLine | 0;
        if (!key[row]) key[row] = [];
        key[row].push({ text: player.name, callback_data: `${player.id}` });
        pos++;
      });

      setTimeout(() => {
        // make sure every vote a player, random vote if needed
        _.map(this.players, (player) => {
          if (!player.getKillTarget()) this.randomVote(player);
        });
        resolve();
      }, this.actionTime);
    });
  }

  private killPlayer() {
    this.setStatus(Game.STATUS_KILL_PLAYER);

    return new Promise((resolve, reject) => {
      this.result = _.reduce(this.players, (result: any, player: Player) => {
        const resultObject = _.find(result, (r: Result) => r.target === player.getKillTarget());
        if (resultObject) {
          resultObject.count++;
        } else {
          result.push({ target: player.getKillTarget(), count: 1 });
        }

        return result;
      }, []);

      // sort result
      this.result = _.reverse(_.sortBy(this.result, (result) => result.count));
      const deaths = _.filter(this.result, (result) => result.count === this.result[0].count && result.count >= 2);

      _.map(deaths, (death) => {
        if (death.target.getOriginalRole() === Role.HUNTER) {
          this.deathPlayers.push(death.target.getKillTarget());
        }
        this.deathPlayers.push(death.target);
      });

      resolve();
    });
  }

  private showResult(msg) {
    this.setStatus(Game.STATUS_END_GAME);
    // TODO: ...
    return new Promise((resolve, reject) => {
      let result = '';

      this.determineWinners();
      this.losers = _.difference(this.players, this.winners);

      result += '[WINNERS]\n';
      _.map(this.winners, (winner: Player) => {
        result += `${winner.name} [Original Role] ${winner.getOriginalRole().name} >> [Role] ${winner.getRole().name}\n`;
      });

      result += '[LOSERS]\n';
      _.map(this.losers, (winner: Player) => {
        result += `${winner.name} [Original Role] ${winner.getOriginalRole().name} >> [Role] ${winner.getRole().name}\n`;
      });
      this.bot.sendMessage(msg.id, result);
      console.log('Result', result);
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
      case Role.DOPPELGANGER: this.setStatus(Game.STATUS_WAKEUP_DOPPELGANGER); break;
      case Role.WEREWOLF: this.setStatus(Game.STATUS_WAKEUP_WEREWOLF); break;
      case Role.MINION: this.setStatus(Game.STATUS_WAKEUP_MINION); break;
      case Role.MASON: this.setStatus(Game.STATUS_WAKEUP_MASON); break;
      case Role.SEER: this.setStatus(Game.STATUS_WAKEUP_SEER); break;
      case Role.ROBBER: this.setStatus(Game.STATUS_WAKEUP_ROBBER); break;
      case Role.TROUBLEMAKER: this.setStatus(Game.STATUS_WAKEUP_TROUBLEMAKER); break;
      case Role.DRUNK: this.setStatus(Game.STATUS_WAKEUP_DRUNK); break;
      case Role.INSOMNIAC: this.setStatus(Game.STATUS_WAKEUP_INSOMNIAC); break;
    }
  }

  private sendInvalidActionMessage(msgId) {
    return this.bot.answerCallbackQuery(msgId, `${Emoji.get('middle_finger')}  Hey! Stop doing that!`);
  }
  
  private viewPlayerRole(player, msg) {
    player.getRole().notifyRole(this.bot, msg);
  }

  private handleAnnouncePlayerEvent(event: string, msg: any, player: Player) {
    switch (event) {
      case 'view_role': this.viewPlayerRole(player, msg); break;
      default: this.sendInvalidActionMessage(msg.id); break;
    }
  }

  private handleWakeUpEvent(event: string, msg: any, player: Player) {
    if (this.getStatus() !== 'wakeup_' + player.getOriginalRole().name.toLowerCase()) {
      return this.sendInvalidActionMessage(msg.id);
    }

    player.getOriginalRole().useAbility(this.bot, msg, this.players, this.table);
  }

  private handleConversationEvent(event: string, msg: any, player: Player) {
    
  }

  private handleVotingEvent(event: string, msg: any, player: Player) {
    player.setKillTarget(_.find(this.players, p => p.id === parseInt(event)));
  }

  private randomVote(player: Player) {
    const id: number = _.random(0, this.players.length - 1);
    player.setKillTarget(_.find(this.players, p => p.id === id));
  }

  private determineWinners() {
    const deathTanners = _.filter(this.deathPlayers, player => player.getRole() === Role.TANNER);
    const deathWerewolfs = _.filter(this.deathPlayers, player => player.getRole() === Role.WEREWOLF);
    const deathMinions = _.filter(this.deathPlayers, player => player.getRole() === Role.MINION);

    if (deathWerewolfs) {
      // has werewolf dead
      if (deathTanners) {
        this.addWinners(deathTanners);
      }

      this.addWinners(this.getNonTannerVillagesTeam());
    } else if (this.hasWerewolfOnTable()) {
      // has werewolf on table
      if (deathTanners) {
        this.addWinners(deathTanners);
      } else {
        this.addWinners(this.getWerewolfTeam());
      }
    } else {
      // no werewolf on table
      if (deathTanners) {
        this.addWinners(deathTanners);
        this.addWinners(this.getWerewolfTeam());
      } else {
        this.addWinners(
          _.difference(
            _.filter(this.players, player => player.getRole() === Role.MINION),
            deathMinions
          )
        );

        this.addWinners(this.getNonTannerVillagesTeam());
      }
    }
  }

  private addWinners(players: Player[]) {
    this.winners = _.merge(this.winners, players);
  }

  private getNonTannerVillagesTeam() {
    return _.filter(this.players, player => (_.indexOf([
      Role.DOPPELGANGER,
      Role.WEREWOLF,
      Role.MINION,
      Role.TANNER,
    ], player.getRole().name) < 0 ));
  }

  private getWerewolfTeam() {
    return _.filter(this.players, player => (_.indexOf([
      Role.DOPPELGANGER,
      Role.WEREWOLF,
      Role.MINION
    ], player.getRole().name) < 0 ));
  }

  private hasWerewolfOnTable() {
    return _.filter(this.players, player => player.getRole() === Role.WEREWOLF);
  }
}