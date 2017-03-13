import { GameEndError } from "./error/gameend";
const util = require('util');
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
  public static PHASE_WAITING_PLAYER: string = 'waiting';
  public static PHASE_START_GAME: string = 'startgame';
  public static PHASE_PREPARE_DECK: string = 'prepare_deck';
  public static PHASE_ANNOUNCE_PLAYER_ROLE: string = 'announce_player_role';
  public static PHASE_START_NIGHT: string = 'start_night';
  public static PHASE_WAKEUP_DOPPELGANGER: string = 'wakeup_doppelganger';
  public static PHASE_WAKEUP_WEREWOLF: string = 'wakeup_werewolf';
  public static PHASE_WAKEUP_MINION: string = 'wakeup_minion';
  public static PHASE_WAKEUP_MASON: string = 'wakeup_mason';
  public static PHASE_WAKEUP_SEER: string = 'wakeup_seer';
  public static PHASE_WAKEUP_ROBBER: string = 'wakeup_robber';
  public static PHASE_WAKEUP_TROUBLEMAKER: string = 'wakeup_troublemaker';
  public static PHASE_WAKEUP_DRUNK: string = 'wakeup_drunk';
  public static PHASE_WAKEUP_INSOMNIAC: string = 'wakeup_insomniac';
  public static PHASE_CONVERSATION: string = 'conversation';
  public static PHASE_VOTING: string = 'voting';
  public static PHASE_KILL_PLAYER: string = 'kill_player';
  public static PHASE_END_GAME: string = 'endgame';

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
  deathPlayers: any[] = [];
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
      .then(() => {
        // debug
        console.log('[announcePlayerRole]');
        console.log('[Deck]', this.deck);
        console.log('[Table]', this.table);
        console.log('[Players]', this.players);
      })
      .then(() => console.log(`Start night`))
      .then(() => this.startNight(msg))
      .then(() => {
        // debug
        console.log('[startDay]');
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
      .then(() => this.showResult(msg));
  }

  end() {
    this.setPhase(Game.PHASE_END_GAME);
  }

  isStarted() {
    return !(this.getPhase() === Game.PHASE_WAITING_PLAYER);
  }

  isEnded() {
    return (this.getPhase() === Game.PHASE_END_GAME);
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
      rtnMsg += `${player.name}\n`;
    });

    this.bot.sendMessage(msg.chat.id, `Player joined:\n${rtnMsg}`);
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

    key.push([{ text: "Blank vote", callback_data: `-1` }]);

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
      let roles: Role[] = [];
      let role: string[] = [];
      _.map(this.players, (p: Player) => {
        roles.push(p.getOriginalRole());
      });
      _.map(this.table.getRoles(), (r: Role) => {
        roles.push(r);
      });

      _.map(_.sortBy(roles, (r:Role) => r.ordering), (r: Role) => {
        role.push(r.fullName);
      });

      this.bot.sendMessage(
        msg.chat.id,
        `${Emoji.get('eyeglasses')}  Everyone, please check your role. The game has below role\n  ` + role.join("\n  "),
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

    return this.bot.sendMessage(msg.chat.id, `${Emoji.get('crescent_moon')}  Night start, Everyone close your eye.`)
      .then(() => this.wakeUp(Role.DOPPELGANGER, msg))
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
        player.getOriginalRole().wakeUp(this.bot, msg, this.players, this.table, player);
      } else {
        let roleCard = _.find(this.table.getRoles(), (r: Role) => r.name === role);

        if (!roleCard) {
          roleCard = _.find(this.players, (p: Player) => p.getRole() === role);
        }

        roleCard.wakeUp(this.bot, msg, this.players, this.table, player);
      }

      setTimeout(() => {
        if (player)
          player.getOriginalRole().endTurn(this.bot, msg, this.players, this.table, player);

        resolve();
      }, this.actionTime * (role == Role.DOPPELGANGER ? 2 : 1));  // 2x action time for DoppelGanger
    });
  }

  private startConversation(msg) {
    this.setPhase(Game.PHASE_CONVERSATION);

    this.bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you have ${this.gameTime / 60 / 1000}mins to discuss ...`
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), this.gameTime);
    });
  }

  private beginVoting(msg: any) {
    this.setPhase(Game.PHASE_VOTING);

    return new Promise((resolve, reject) => {

      this.bot.sendMessage(msg.chat.id, `${Emoji.get('alarm_clock')}  Time\'s up. Everyone please vote.`)
        .then(this.sendVotingList(msg.chat.id))
        .then(setTimeout(() => {
          // make sure every vote a player, random vote if needed
          _.map(this.players, (player) => {
            if (!player.getKillTarget()) this.randomVote(player);
          });
          resolve();
        }, this.actionTime));
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
      this.result = _.reverse(_.sortBy(this.result, (result) => result.count));
      const deaths = _.filter(this.result, (result) => result.count >= this.result[0].count && result.count >= 2);
      
      console.log('this.result', util.inspect(this.result, false, 3));
      _.map(deaths, (death: Result) => {
        if (death.target.getOriginalRole() === Role.HUNTER) {
          this.deathPlayers.push(_.assignIn(death.target.getKillTarget(), {"count": "HUNTER"}));
        }
        this.deathPlayers.push(_.assignIn(death.target, { "count": death.count }));
      });

      resolve();
    });
  }

  private showResult(msg) {
    this.setPhase(Game.PHASE_END_GAME);

    return new Promise((resolve, reject) => {
      let result = '';

      this.winners = this.determineWinners(this.deathPlayers);
      this.losers = _.difference(this.players, this.winners);

      result += `${Emoji.get('skull')}\n`;
      _.map(this.deathPlayers, (death) => {
        result += `${death.name} ${death.getOriginalRole().emoji} ${Emoji.get('arrow_right')} ${death.getRole().emoji}  ${Emoji.get('point_left')} ${death.count} \n`;
      });

      result += `\n${Emoji.get('trophy')}${Emoji.get('full_moon_with_face')}\n`;
      _.map(this.winners, (winner: Player) => {
        result += `${winner.name} ${winner.getOriginalRole().emoji} ${Emoji.get('arrow_right')} ${winner.getRole().emoji}  ${Emoji.get('point_right')} ${winner.getKillTarget().name} \n`;
      });

      result += `\n${Emoji.get('new_moon_with_face')}\n`;
      _.map(this.losers, (loser: Player) => {
        result += `${loser.name} ${loser.getOriginalRole().emoji} ${Emoji.get('arrow_right')} ${loser.getRole().emoji}  ${Emoji.get('point_right')} ${loser.getKillTarget().name} \n`;
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
    if (this.phase === Game.PHASE_END_GAME && phase != Game.PHASE_END_GAME) {
      throw new GameEndError();
    }

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
    if (this.getPhase() !== 'wakeup_' + player.getOriginalRole().name.toLowerCase() &&
        !(player.getOriginalRole().name == Role.DOPPELGANGER
          && this.getPhase() == 'wakeup_' + player.getOriginalRole().shadowChoice.toLowerCase()
          && _.some([Role.WEREWOLF, Role.MINION, Role.MASON, Role.INSOMNIAC], player.getOriginalRole().shadowChoice))) {  //Some role for doppleganger is action together with others (Werewolf, Minion, Mason, Insomniac)
      return this.sendInvalidActionMessage(msg.id);
    }

    player.getOriginalRole().useAbility(this.bot, msg, this.players, this.table, player);
  }

  private handleConversationEvent(event: string, msg: any, player: Player) {
    const id = parseInt(event);

    if (player.id === id) {
      return this.sendInvalidActionMessage(msg.id);
    }

    this.votePlayer(id, msg, player);
  }

  private handleVotingEvent(event: string, msg: any, player: Player) {
    const id = parseInt(event);

    if (player.id === id) {
      return this.sendInvalidActionMessage(msg.id);
    }

    this.votePlayer(id, msg, player);
  }

  private randomVote(player: Player) {
    const targets = _.filter(this.players, p => p.id !== player.id);
    const pos = _.random(0, targets.length - 1);
    player.setKillTarget(targets[pos]);
  }

  private determineWinners(deathPlayers: Player[]) {
    let winners: Player[] = [];

    const deathTanners = _.filter(deathPlayers, player => player.getRole().name === Role.TANNER);
    const deathWerewolfs = _.filter(deathPlayers, player => player.getRole().name === Role.WEREWOLF);
    const deathVillages = _.filter(deathPlayers, player => _.indexOf([
      Role.WEREWOLF, Role.MINION, Role.TANNER
    ], player.getRole().name) < 0);

    console.log('this.deathPlayers', deathPlayers);
    console.log('deathTanners', deathTanners);
    console.log('deathWerewolfs', deathWerewolfs);
    console.log('deathVillages', deathVillages);
    console.log('hasWerewolfOnTable()', this.hasWerewolfOnTable());

    // Tanner always win when he die
    winners = _.concat(this.winners, deathTanners);

    if (deathWerewolfs.length > 0) {
      // If any wolf is die, all Village win
      winners = _.concat(this.winners, this.getNonTannerVillagesTeam());
    } else if (this.hasWerewolfOnTable()) {
      // If no wolf is die, but tanner is alive, wolf win
      if (deathTanners.length === 0) {
        winners = _.concat(this.winners, this.getWerewolfTeam());
      }
    } else if (deathPlayers.length === 0) {
      // If no one die and there is no wolf, Village win
      winners = _.concat(this.winners, this.getNonTannerVillagesTeam());
    } else if (deathVillages.length || deathTanners) {
      // If no wolf + Village/Tanner die, Minion will win
      winners = _.concat(this.winners, this.getWerewolfTeam());
    }

    return winners;
  }

  private getNonTannerVillagesTeam() {
    return _.filter(this.players, player => (_.indexOf([
      Role.DOPPELGANGER,
      Role.WEREWOLF,
      Role.MINION,
      Role.TANNER,
    ], player.getRole().name) < 0));
  }

  private getWerewolfTeam() {
    return _.filter(this.players, player => (_.indexOf([
      Role.DOPPELGANGER,
      Role.WEREWOLF,
      Role.MINION
    ], player.getRole().name) >= 0 ));
  }

  private hasWerewolfOnTable() {
    const werewolfs = _.filter(this.players, player => player.getRole().name === Role.WEREWOLF);
    return werewolfs.length > 0;
  }

  private votePlayer(id: number, msg, player) {
    let target = _.find(this.players, p => p.id === id);
    if (id == -1) target = new Player({id: -1, name: ""});
    let rtnMsg = "";
    if (target) {
      player.setKillTarget(target);
      rtnMsg = `${Emoji.get('point_up_2')}  You have vote ${target.name}`;
    }
    else {
      rtnMsg = `Invalid player selected !`;
    }

    this.bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}