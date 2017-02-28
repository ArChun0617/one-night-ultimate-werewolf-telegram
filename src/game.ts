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
  public static PHASE_WAITING_PLAYER:string = 'waiting';
  public static PHASE_START_GAME:string = 'startgame';
  public static PHASE_PREPARE_DECK:string = 'prepare_deck';
  public static PHASE_ANNOUNCE_PLAYER_ROLE:string = 'announce_player_role';
  public static PHASE_START_NIGHT:string = 'start_night';
  public static PHASE_WAKEUP_DOPPELGANGER:string = 'wakeup_doppelganger';
  public static PHASE_WAKEUP_WEREWOLF:string = 'wakeup_werewolf';
  public static PHASE_WAKEUP_MINION:string = 'wakeup_minion';
  public static PHASE_WAKEUP_MASON:string = 'wakeup_mason';
  public static PHASE_WAKEUP_SEER:string = 'wakeup_seer';
  public static PHASE_WAKEUP_ROBBER:string = 'wakeup_robber';
  public static PHASE_WAKEUP_TROUBLEMAKER:string = 'wakeup_troublemaker';
  public static PHASE_WAKEUP_DRUNK:string = 'wakeup_drunk';
  public static PHASE_WAKEUP_INSOMNIAC:string = 'wakeup_insomniac';
  public static PHASE_CONVERSATION:string = 'conversation';
  public static PHASE_VOTING:string = 'voting';
  public static PHASE_KILL_PLAYER:string = 'kill_player';
  public static PHASE_END_GAME:string = 'endgame';

  id: number;
  players: any[];
  table: Table = new Table();
  bot: any;
  deck: Deck;
  gameRoles: string[];
  gameTime: number = process.env.GAME_TIME || 10 * 60 * 1000;
  actionTime: number = process.env.ACTION_TIME || 10 * 1000;
  btnPerLine: number = process.env.BTN_PER_LINE || 3;
  phase: string = Game.PHASE_WAITING_PLAYER;
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
    this.setPhase(Game.PHASE_START_GAME);
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
    return !(this.getPhase() === Game.PHASE_WAITING_PLAYER);
  }

  getPhase(): string {
    return this.phase;
  }

  addPlayer(msg, player: Player) {
    if (!this.getPlayer(player.id)) {
      this.players.push(player);
    }

    let rtnMsg: string = '';
    _.map(this.players, (player: Player) => {
      rtnMsg += `${player.name} \n`;
    });

    this.bot.sendMessage(msg.chat.id, `Player joined: \n ${rtnMsg}`);
    console.log(this.players);
  }

  getPlayer(id: number) {
    return _.find(this.players, player => player.id === id);
  }

  sendVotingList(msgId: number) {
    if (this.getPhase() !== Game.PHASE_CONVERSATION && this.getPhase() !== Game.PHASE_VOTING) {
      return this.sendInvalidActionMessage(msgId);
    }

    const key = [];
    let pos = 0;

    _.map(this.players, (player: Player) => {
      let row = pos / this.btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: `${player.id}` });
      pos++;
    });

    this.bot.sendMessage(msgId,
      `${Emoji.get('point_up_2')}  Voting list`,
      {
        reply_markup: JSON.stringify({ inline_keyboard: key })
      });
  }

  on(event, msg) {
    // status validation
    if (_.indexOf([
        Game.PHASE_WAITING_PLAYER,
        Game.PHASE_START_GAME,
        Game.PHASE_PREPARE_DECK,
        Game.PHASE_START_NIGHT,
        Game.PHASE_KILL_PLAYER,
        Game.PHASE_END_GAME
      ], this.getPhase()) >= 0) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    const player = this.getPlayer(msg.from.id);
    console.log(`Callback_query Called [Game]: ${this.id} | [Event]: ${event} | [Player] ${player ? player.name + "(" + player.getRole().name + ")" : 'Nan'}`);

    if (!player) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    switch (this.getPhase()) {
      case Game.PHASE_ANNOUNCE_PLAYER_ROLE: this.handleAnnouncePlayerEvent(event, msg, player); break;
      case Game.PHASE_CONVERSATION: this.handleConversationEvent(event, msg, player); break;
      case Game.PHASE_VOTING: this.handleVotingEvent(event, msg, player); break;
      default: this.handleWakeUpEvent(event, msg, player); break;
    }
  }

  private prepareDeck() {
    this.setPhase(Game.PHASE_PREPARE_DECK);

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
    this.setPhase(Game.PHASE_ANNOUNCE_PLAYER_ROLE);

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
    this.setPhase(Game.PHASE_START_NIGHT);
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

    this.setWakeUpPhase(role);

    return new Promise((resolve, reject) => {
      const player: Player = _.find(this.players, (p) => p.getOriginalRole().name === role);

      if (player) {
        player.getOriginalRole().wakeUp(this.bot, msg, this.players, this.table);
      } else {
        const npc = _.find(this.table.getRoles(), (r: Role) => r.name === role);
        npc.wakeUp(this.bot, msg, this.players, this.table);
      }

      setTimeout(() => {
        if (player)
          player.getOriginalRole().endTurn(this.bot, msg, this.players, this.table);

        resolve();
      }, this.actionTime);
    });
  }

  private startConversation(msg) {
    this.setPhase(Game.PHASE_CONVERSATION);

    this.bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you have 10mins to discuss ...`
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), this.gameTime);
    });
  }

  private beginVoting(msg: any) {
    this.setPhase(Game.PHASE_VOTING);

    return new Promise((resolve, reject) => {
      this.bot.sendMessage(msg.chat.id,`${Emoji.get('alarm_clock')}  Time\'s up. Everyone please vote.`);

      this.sendVotingList(msg.chat.id);

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
    this.setPhase(Game.PHASE_KILL_PLAYER);

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
      this.result = _.sortBy(this.result, (result) => result.count);
      const deaths = _.filter(this.result, (result) => result.count === this.result[0].count && result.count >= 2);

      console.log('this.result', this.result);
      _.map(deaths, (death: Result) => {
        if (death.target.getOriginalRole() === Role.HUNTER) {
          this.deathPlayers.push(death.target.getKillTarget());
        }
        this.deathPlayers.push(death.target);
      });

      resolve();
    });
  }

  private showResult(msg) {
    this.setPhase(Game.PHASE_END_GAME);

    return new Promise((resolve, reject) => {
      let result = '';

      this.determineWinners();
      this.losers = _.difference(this.players, this.winners);

      result += '[WINNERS]\n';
      _.map(this.winners, (winner: Player) => {
        result += `${winner.name}\t\t[Role] ${winner.getOriginalRole().name}\t\t >> ${winner.getRole().name}\n`;
      });

      result += '[LOSERS]\n';
      _.map(this.losers, (loser: Player) => {
        result += `${loser.name}\t\t[Role] ${loser.getOriginalRole().name}\t\t >> ${loser.getRole().name}\n`;
      });
      this.bot.sendMessage(msg.chat.id, result);
      console.log('Result', result);
      resolve();
    });
  }

  private isExistInCurrentGame(role) {
    return _.indexOf(this.gameRoles, role) >= 0;
  }

  private setPhase(phase: string) {
    this.phase = phase;
  }

  private setWakeUpPhase(role) {
    switch (role) {
      case Role.DOPPELGANGER: this.setPhase(Game.PHASE_WAKEUP_DOPPELGANGER); break;
      case Role.WEREWOLF: this.setPhase(Game.PHASE_WAKEUP_WEREWOLF); break;
      case Role.MINION: this.setPhase(Game.PHASE_WAKEUP_MINION); break;
      case Role.MASON: this.setPhase(Game.PHASE_WAKEUP_MASON); break;
      case Role.SEER: this.setPhase(Game.PHASE_WAKEUP_SEER); break;
      case Role.ROBBER: this.setPhase(Game.PHASE_WAKEUP_ROBBER); break;
      case Role.TROUBLEMAKER: this.setPhase(Game.PHASE_WAKEUP_TROUBLEMAKER); break;
      case Role.DRUNK: this.setPhase(Game.PHASE_WAKEUP_DRUNK); break;
      case Role.INSOMNIAC: this.setPhase(Game.PHASE_WAKEUP_INSOMNIAC); break;
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
    if (this.getPhase() !== 'wakeup_' + player.getOriginalRole().name.toLowerCase()) {
      return this.sendInvalidActionMessage(msg.id);
    }

    player.getOriginalRole().useAbility(this.bot, msg, this.players, this.table);
  }

  private handleConversationEvent(event: string, msg: any, player: Player) {
    // reject to vote himself
    if (player.id === parseInt(event)) {
      return this.sendInvalidActionMessage(msg.id);
    }

    player.setKillTarget(_.find(this.players, p => p.id === parseInt(event)));
  }

  private handleVotingEvent(event: string, msg: any, player: Player) {
    // reject to vote himself
    if (player.id === parseInt(event)) {
      return this.sendInvalidActionMessage(msg.id);
    }

    player.setKillTarget(_.find(this.players, p => p.id === parseInt(event)));
  }

  private randomVote(player: Player) {
    const id: number = _.random(0, this.players.length - 1);
    player.setKillTarget(_.find(this.players, p => p.id === id));
  }

  private determineWinners() {
    const deathTanners = _.filter(this.deathPlayers, player => player.getRole() === Role.TANNER);
    const deathWerewolfs = _.filter(this.deathPlayers, player => player.getRole() === Role.WEREWOLF);
    const deathVillages = _.filter(this.deathPlayers, player => _.indexOf([
      Role.WEREWOLF, Role.MINION, Role.TANNER
    ], player.getRole()) < 0);

    this.addWinners(deathTanners);

    if (deathWerewolfs) {
      this.addWinners(this.getNonTannerVillagesTeam());
    } else if (this.hasWerewolfOnTable()) {
      this.addWinners(this.getWerewolfTeam());
    } else if (this.deathPlayers.length === 0) {
      this.addWinners(this.getNonTannerVillagesTeam());
    } else if (deathVillages.length || deathTanners) {
      this.addWinners(this.getWerewolfTeam());
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