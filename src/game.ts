const util = require('util');
import { GameEndError } from "./error/gameend";
import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { DeckFactory } from "./deck/deckFactory";
import { Role, RoleClass, RoleClassInterface } from "./role/role";
import { Deck } from "./deck/deck";
import { Player } from "./player/player";
import { Table } from "./npc/table";
import { ActionFootprint } from "./util/ActionFootprint";
import { MessagerInterface } from "./util/MessagerInterface";
import { Language } from "./util/Language";

interface Result {
  target: Player;
  count: number;
}

export class Game {
  public static PHASE_WAITING_PLAYER: string = 'waiting';
  public static PHASE_NEW_GAME: string = 'newgame';
  public static PHASE_START_GAME: string = 'startgame';
  public static PHASE_PREPARE_DECK: string = 'prepare_deck';
  public static PHASE_ANNOUNCE_PLAYER_ROLE: string = 'announce_player_role';
  public static PHASE_START_NIGHT: string = 'start_night';
  public static PHASE_WAKEUP_COPYCAT: string = 'wakeup_role_copycat';
  public static PHASE_WAKEUP_DOPPELGANGER: string = 'wakeup_role_doppelganger';
  public static PHASE_WAKEUP_WEREWOLF: string = 'wakeup_role_werewolf';
  public static PHASE_WAKEUP_MINION: string = 'wakeup_role_minion';
  public static PHASE_WAKEUP_MASON: string = 'wakeup_role_mason';
  public static PHASE_WAKEUP_SEER: string = 'wakeup_role_seer';
  public static PHASE_WAKEUP_ROBBER: string = 'wakeup_role_robber';
  public static PHASE_WAKEUP_TROUBLEMAKER: string = 'wakeup_role_troublemaker';
  public static PHASE_WAKEUP_DRUNK: string = 'wakeup_role_drunk';
  public static PHASE_WAKEUP_INSOMNIAC: string = 'wakeup_role_insomniac';
  public static PHASE_CONVERSATION: string = 'conversation';
  public static PHASE_VOTING: string = 'voting';
  public static PHASE_KILL_PLAYER: string = 'kill_player';
  public static PHASE_END_GAME: string = 'endgame';
  
  lang: Language = new Language();
  id: number;
  players: any[];
  table: Table = new Table();
  msgInterface: MessagerInterface;
  deck: Deck;
  gameRoles: RoleClassInterface[];
  gameTime: number = 10 * 60 * 1000;
  actionTime: number = 10 * 1000;
  btnPerLine: number = 3;
  phase: string = Game.PHASE_WAITING_PLAYER;
  result: Result[] = [];
  deathPlayers: any[] = [];
  winners: Player[] = [];
  losers: Player[] = [];
  actionStack: ActionFootprint[] = [];
  newbieMode: boolean = false;
  isDebug: boolean = false;
  adminTG: number = 322552798;

  votingTimer: any;
  votingResolve: any;

  constructor(chatID: number, bot: any, players: Player[], roles: RoleClassInterface[], newbieMode: boolean = false) {
    this.id = chatID;
    this.msgInterface = new MessagerInterface(bot, newbieMode);
    this.msgInterface.chatID = chatID;
    this.gameRoles = roles;
    this.players = players;
    this.newbieMode = newbieMode;
  }
  
  addGameSettingRole(role: RoleClassInterface) {
    const roles = [
      { name: RoleClass.COPYCAT.name, max: 1 },
      { name: RoleClass.DOPPELGANGER.name, max: 1 },
      { name: RoleClass.WEREWOLF.name, max: 2 },
      { name: RoleClass.MINION.name, max: 1 },
      { name: RoleClass.MASON.name, max: 2 },
      { name: RoleClass.SEER.name, max: 1 },
      { name: RoleClass.ROBBER.name, max: 1 },
      { name: RoleClass.TROUBLEMAKER.name, max: 1 },
      { name: RoleClass.DRUNK.name, max: 1 },
      { name: RoleClass.INSOMNIAC.name, max: 1 },
      { name: RoleClass.VILLAGER.name, max: 3 },
      { name: RoleClass.HUNTER.name, max: 1 },
      { name: RoleClass.TANNER.name, max: 1 }
    ];
    const roleSetting = _.find(roles, r => r.name === role.name);

    if (_.filter(this.gameRoles, (r) => r === role).length <= roleSetting.max) {
      this.gameRoles.push(role);
      //bot.answerCallbackQuery(msgId, `${Emoji.get('white_check_mark')}  Added ${role}`);
    } else {
      //bot.answerCallbackQuery(msgId, `${Emoji.get('no_entry_sign')}  Too many ${role}`);
    }
  }
  
  addGameRole(roles: RoleClassInterface[]) {
    this.gameRoles = roles;
  }

  start(msg) {
    if (this.getPhase() != Game.PHASE_WAITING_PLAYER) return; //Prevent double start game
    console.log(`[Start] PlayerID: ${this.id}`)

    // Auto apply role by number of user, *unless* user below 3, then debug mode.
    if(this.players.length < 3) {
      const playerTemp = [
        "Thomas",
        "Kenny",
        "Gary",
        "Rico",
        "Paul",
        "Luis",
        "Wilson",
        "Serina",
        "Tab",
        "Raphael"
      ];

      // TODO: hardcode to add dummy players
      if (this.players.length < this.gameRoles.length - 3)
        for (let i = this.players.length; i < this.gameRoles.length - 3; i++) {
          //game.players.push(new Player({ id: i, name: 'Player'+i }));
          this.players.push(new Player({ id: i, name: "AI_" + playerTemp.shift() }));
        }

      //Debug mode = 3sec action
      this.actionTime = 1 * 500;
      this.isDebug = true;
    }
    else {
      // normal game (at least 3 player)
      this.gameRoles = this.gameRoles.slice(0, this.players.length + 3);  
    }

    if (this.players.length + 3 !== this.gameRoles.length) {
      return Promise.reject('Number of players and roles doesn\'t match');
    }
    
    this.setLang(this.lang.culture);

    console.log(`GAME [${this.id}] started`);
    this.msgInterface.sendMsg(this.lang.getString("GAME_START"));

    return this.prepareDeck(this.lang.culture)
      .then(() => console.log(`>> [Announce player role]`))
      .then(() => this.announcePlayerRole(msg, this.actionTime * 2))
      .then(() => {
        // debug
        console.log(`>> [${this.id}:announcePlayerRole]`);
        console.log(`>> [${this.id}:Deck]`, this.deck);
        //console.log(`>> [${this.id}:Table]`, util.inspect(this.table, { colors: true }));
        console.log(`>> [${this.id}:Table]`, util.inspect(_.map(this.table.getRoles(), (r: Role) => { return `${r.emoji}${r.name}` }), { colors: true }));
        //console.log(`>> [${this.id}:Players]`, util.inspect(this.players, { colors: true }));
        console.log(`>> [${this.id}:Players]`, util.inspect(_.map(this.players, (p: Player) => { return `${p.name} : ${p.role.emoji}${p.role.name}` }), { colors: true }));
      })
      .then(() => console.log(`>> [${this.id}:Start night]`))
      .then(() => this.startNight(msg, this.actionTime))
      .then(() => {
        // debug
        console.log(`>> [${this.id}:Start Day]`);
        console.log(`>> [${this.id}:Deck]`, this.deck);
        //console.log(`>> [${this.id}:Table]`, util.inspect(this.table, { colors: true }));
        console.log(`>> [${this.id}:Table]`, util.inspect(_.map(this.table.getRoles(), (r: Role) => { return `${r.emoji}${r.name}` }), { colors: true }));
        //console.log(`>> [${this.id}:Players]`, util.inspect(this.players, { colors: true }));
        console.log(`>> [${this.id}:Players]`, util.inspect(_.map(this.players, (p: Player) => { return `${p.name} : ${p.role.emoji}${p.role.name}` }), { colors: true }));
        //console.log(`>> [${this.id}:ActionStack]`, util.inspect(this.actionStack, { colors: true }));
        console.log(`>> [${this.id}:ActionStack]`, util.inspect(_.map(this.actionStack, (a: ActionFootprint) => { return `${a.toDetailString()}` }), { colors: true }));
      })
      .then(() => console.log(`>> [${this.id}:Start conversation]`))
      .then(() => this.startConversation(msg, this.gameTime * (this.players.length > 6 ? 2 : 1)))  // If more than 6 player, then game time *2
      .then(() => console.log(`>> [${this.id}:Begin voting]`))
      .then(() => this.beginVoting(msg, this.actionTime * 2))
      .then(() => console.log(`>> [${this.id}:Kill player]`))
      .then(() => this.killPlayer())
      .then(() => console.log(`>> [${this.id}:Show result]`))
      .then(() => this.showResult(msg));
  }

  end() {
    this.setPhase(Game.PHASE_END_GAME);
    if (this.votingTimer) clearTimeout(this.votingTimer);
  }

  isStarted() {
    return !(this.getPhase() === Game.PHASE_WAITING_PLAYER);
  }

  isEnded() {
    return (this.getPhase() === Game.PHASE_END_GAME);
  }

  showRole() {
    let role: string[] = [];
    _.map(this.getGameRole(), (r: Role) => {
      role.push(r.fullName);
    });

    return role.join("\n");
  }

  setLang(_lang: string) {
    this.lang.setLang(_lang);

    _.map(this.players, (player: Player) => {
      player.setLang(_lang);
    });

    _.map(this.table.getRoles(), (role: Role) => {
      role.setLang(_lang);
    });
  }

  getPhase(): string {
    return this.phase;
  }

  addPlayer(msg, player: Player) {
    if (this.players.length >= 8) {
      this.msgInterface.sendMsg(this.lang.getString("TOO_MANY_PLAYER"));
      return;
    }

    if (!this.getPlayer(player.id)) {
      this.players.push(player);
    }

    let rtnMsg: string = '';
    _.map(this.players, (player: Player) => {
      rtnMsg += `${player.name} ${(player.readyStart ? "[READY]" : "")}\n`;
    });

    this.msgInterface.sendMsg(this.lang.getString("PLAYER_LIST") + rtnMsg);
  }

  getPlayer(id: number) {
    return _.find(this.players, player => player.id === id);
  }

  checkGameStart(_id: number) {
    let rtnMsg: string = '';
    let player: Player[];

    player = _.filter(this.players, (player: Player) => player.id == _id && player.isHost);

    // If the caller is host, then start (return empty), else prompt
    if (player.length != 1) {
      this.msgInterface.sendMsg(this.lang.getString("WAIT_FOR_START"));
      rtnMsg = this.lang.getString("WAIT_FOR_START");
    }

    // If less than 3 player, check is admin
    if (player.length < 3) {
      if (player[0].id != this.adminTG) {
        this.msgInterface.sendMsg(this.lang.getString("GAME_ERROR_PLAYER_NOT_ENOUGH"));
        rtnMsg = this.lang.getString("GAME_ERROR_PLAYER_NOT_ENOUGH");
      }
    }

    /*
    //Set executor to [READY]
    _.map(_.filter(this.players, (player: Player) => player.id == _id), (player: Player) => player.readyStart = true);

    //Check if all player set ready
    if (_.filter(this.players, (player: Player) => !player.readyStart).length > 0) {
        //else show list of player
        _.map(this.players, (player: Player) => {
          rtnMsg += `${player.name} ${(player.readyStart ? "[READY]" : "")}\n`;
        });
        
        this.msgInterface.sendMsg(this.lang.getString("WAIT_FOR_START") + "\n" + rtnMsg);
    }
    */
        
    return rtnMsg;
  }

  sendVotingList(msg) {
    if (this.getPhase() !== Game.PHASE_CONVERSATION && this.getPhase() !== Game.PHASE_VOTING) {
      return this.sendInvalidActionMessage(msg.chat.id);
    }

    const key = [];
    let pos = 0;

    _.map(this.players, (player: Player) => {
      let row = pos / this.btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: `${player.name}${(player.getKillTarget() ? this.lang.getString("PLAYER_VOTED") : "")}`, callback_data: `${player.id}` });
      pos++;
    });

    key.push([{ text: this.lang.getString("VOTE_BLANK"), callback_data: `-1` }]);
    
    //If call by command, sendMsg; If call by button, update message
    this.msgInterface.sendVoteMessage(this.lang.getString("VOTE_LIST"), msg, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    });
  }

  setToken(msg) {
    let p: Player = this.getPlayer(msg.from.id);
    if (!p) { return; } // If player not in game, throw the call
    //console.log("game.setToken: " + msg.data);
    
    const regex = /SET_TOKEN_(.+)/;
    const para: string[] = regex.exec(msg.data);
    const roleName: string = para[1].toUpperCase();

    // Token remain unchanged
    if (p.token && p.token.code.toUpperCase() == roleName) return;

    // Create Token for the player himself
    p.setToken(DeckFactory.createRoleByCode(roleName));
    // Show the token list
    this.showToken(msg);
    return;
  }

  showToken(msg) {
    let p: Player = this.getPlayer(msg.from.id);
    if (!p) { return; } // If player not in game, throw the call
    
    let rtnMsg: string = '';
    _.map(this.players, (player: Player) => {
      rtnMsg += `${player.name} - ${(player.token ? player.token.fullName : this.lang.getString("TOKEN_UNKNOWN"))}\n`;
    });

    const roleList: Role[] = this.getGameRole();
    const key = [];
    let pos = 0;
    let btnPerLine = 3;

    _.map(_.uniqBy(roleList, "code"), (role: Role) => {
      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: role.fullName, callback_data: "SET_TOKEN_" + role.code.toUpperCase() });
      pos++;
    });
    
    //If call by command, sendMsg; If call by button, update message
    this.msgInterface.sendTokenMessage(this.lang.getString("TOKEN_LIST") + rtnMsg, msg, {
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
    //console.log(`Callback_query Called [Game]: ${this.id} | [Event]: ${event} | [Player] ${player ? player.name + "(" + player.getRole().name + ")" : 'Nan'}`);

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

  private prepareDeck(lang: string) {
    this.setPhase(Game.PHASE_PREPARE_DECK);

    return new Promise((resolve, reject) => {
      this.deck = DeckFactory.generate(this.gameRoles);

      //Set the language
      _.map(this.deck.getRoles(), (r: Role) => {
        r.setLang(lang);
      })

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

  private announcePlayerRole(msg, timeDuration: number) {
    this.setPhase(Game.PHASE_ANNOUNCE_PLAYER_ROLE);

    return new Promise((resolve, reject) => {
      let role: string[] = [];
      _.map(this.getGameRole(), (r: Role) => {
        role.push(r.fullName);
      });

      this.msgInterface.sendMsg(
        this.lang.getString("GAME_CHECK_ROLE") + role.join("\n  "),
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: this.lang.getString("GAME_VIEW_ROLE"), callback_data: 'view_role' }]
            ]
          })
        }
      );

      this.setCountDown(msg, timeDuration, [10000, 5000], "sec");
      setTimeout(() => resolve(), timeDuration); // Check role for double time
    });
  }

  private startNight(msg, timeDuration: number) {
    this.setPhase(Game.PHASE_START_NIGHT);

    return this.msgInterface.sendMsg(this.lang.getString("GAME_NIGHT_START"))
      .then(() => this.msgInterface.sendMsg(this.lang.getString("GAME_START")))
      .then((sended) => this.msgInterface.actionID = sended.message_id)
      .then(() => this.wakeUp(msg, RoleClass.COPYCAT, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.DOPPELGANGER, timeDuration * 2))  // 2x action time for DoppelGanger
      .then(() => this.wakeUp(msg, RoleClass.WEREWOLF, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.MINION, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.MASON, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.SEER, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.ROBBER, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.TROUBLEMAKER, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.DRUNK, timeDuration))
      .then(() => this.wakeUp(msg, RoleClass.INSOMNIAC, timeDuration));
  }

  private wakeUp(msg, role, timeDuration: number): Promise<any> {
    if (!this.isExistInCurrentGame(role)) return Promise.resolve();
    if (this.isEnded()) return Promise.reject("");

    this.setWakeUpPhase(role);

    return new Promise((resolve, reject) => {
      let players: Player[] = _.filter(this.players, (p) => p.getOriginalRole().checkRole([role], false));

      if (players && players.length > 0) {
        players[0].getOriginalRole().wakeUp(this.msgInterface, msg, this.players, this.table);
      } else {
        let roleCard = _.find(this.table.getRoles(), (r: Role) => r.checkRole([role], false));

        if (!roleCard) {
          let tempPlayer = _.find(this.players, (p: Player) => p.getRole().checkRole([role], false));
          if (!tempPlayer)
            throw new TypeError(`${role.name} is not found in both Table & Player !`);
          else
            roleCard = tempPlayer.getRole();
        }
        roleCard.wakeUp(this.msgInterface, msg, this.players, this.table,);
      }

      if (this.isDebug) {
        // Auto-action only when debug mode
        setTimeout(() => {
          _.map(_.filter(this.players, (p) => p.getOriginalRole().checkRole([role])),
            (player) => {
              // Start - prevent auto shadow action in Copycat.endTurn()
              let role: any = player.getOriginalRole();
              let shadowRoleName: string = (role.shadowChoice ? role.shadowChoice.code.toLowerCase() : "");
              if (this.getPhase() == Game.PHASE_WAKEUP_COPYCAT && shadowRoleName)
                return; // If the already shadow someone, then skip endTurn;
              // End - prevent auto shadow action in Copycat.endTurn()
  
              let footprint: ActionFootprint;
              footprint = player.getOriginalRole().endTurn(this.msgInterface, msg, this.players, this.table, player);
  
              if (footprint && footprint.action)
                this.actionStack.push(footprint);
            });
  
          resolve();
        }, timeDuration);
      }
    });
  }

  private startConversation(msg, gameDuration: number) {
    let now: Date = new Date(new Date().getTime() + gameDuration);
    this.setPhase(Game.PHASE_CONVERSATION);

    //this.lang.getString("GAME_DAY_START") + (gameDuration / 60 / 1000) + this.lang.getString("GAME_DAY_START_VOTE") + (now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + now.getSeconds())
    this.msgInterface.editAction(this.lang.getString("GAME_DAY_START") + (gameDuration / 60 / 1000) + this.lang.getString("GAME_DAY_START_VOTE") + (now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + now.getSeconds())
      , {
        reply_markup: JSON.stringify({ inline_keyboard: [[{ text: this.lang.getString("GAME_DAY_DOZED"), callback_data: "DOZED_WAKE_UP" }],
        [{ text: this.lang.getString("GAME_DAY_SHOWOKEN"), callback_data: "SHOWOKEN_TOOLS" }, { text: this.lang.getString("GAME_DAY_VOTE"), callback_data: "VOTE_TOOLS" }]] })
      }
    );

    this.setCountDown(msg, gameDuration, [300000, 180000, 60000, 30000], "mins");

    const AIPlayers = _.filter(this.players, (player) => player.id <= 20);
    _.map(AIPlayers, (ai: Player) => {
      this.randomVote(ai);            //Random vote for AI immediately
      ai.setToken(ai.getRole());      //Set token for AI
    });

    return new Promise((resolve, reject) => {
      this.votingResolve = resolve;
      setTimeout(() => resolve(), gameDuration);
    });
  }

  private beginVoting(msg: any, timeDuration: number) {
    this.setPhase(Game.PHASE_VOTING);

    return new Promise((resolve, reject) => {
      if (_.filter(this.players, (player) => !(player.getKillTarget())).length == 0) {
        clearTimeout(this.votingTimer);
        resolve();
      }
      else {
        this.msgInterface.sendMsg(this.lang.getString("VOTE_START"))
          .then(this.sendVotingList(msg))
          .then(setTimeout(() => {
            // make sure every vote a player, random vote if needed
            _.map(this.players, (player) => {
              if (!player.getKillTarget()) this.randomVote(player);
            });
            resolve();
          }, timeDuration));
      }
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
      
      //console.log('this.result', util.inspect(this.result, false, 3));
      _.map(deaths, (death: Result) => {
        if (death.target.getOriginalRole().checkRole([RoleClass.HUNTER])) {
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

      /*
      result += `<b>${Emoji.get('skull')} ${this.lang.getString("RESULT_DEATHS")}</b>\n`;
      _.map(this.deathPlayers, (death) => {
        result += `${death.name} ${(this.newbieMode ? death.getOriginalRole().fullName : death.getOriginalRole().emoji)} ${Emoji.get('arrow_right')} ${(this.newbieMode ? death.getRole().fullName : death.getRole().emoji)}  ${Emoji.get('point_left')} ${death.count} \n`;
      });

      result += `\n<b>${Emoji.get('trophy')}${Emoji.get('full_moon_with_face')} ${this.lang.getString("RESULT_WINNERS")}</b>\n`;
      _.map(this.winners, (winner: Player) => {
        result += `${winner.name} ${(this.newbieMode ? winner.getOriginalRole().fullName : winner.getOriginalRole().emoji)} ${Emoji.get('arrow_right')} ${(this.newbieMode ? winner.getRole().fullName : winner.getRole().emoji)}  ${Emoji.get('point_right')} ${winner.getKillTarget().name} \n`;
      });

      result += `\n<b>${Emoji.get('new_moon_with_face')} ${this.lang.getString("RESULT_LOSERS")}</b>\n`;
      _.map(this.losers, (loser: Player) => {
        result += `${loser.name} ${(this.newbieMode ? loser.getOriginalRole().fullName : loser.getOriginalRole().emoji)} ${Emoji.get('arrow_right')} ${(this.newbieMode ? loser.getRole().fullName : loser.getRole().emoji)}  ${Emoji.get('point_right')} ${loser.getKillTarget().name} \n`;
      });
      */
      
      result += `<b>${this.lang.getString("RESULT_PLAYERS")}</b>\n`;
      _.map(_.sortBy(this.winners, (winner: Player) => winner.getKillTarget().name), (winner: Player) => {
        result += `${Emoji.get('trophy')}`;
        if(_.find(this.deathPlayers, (d: Player) => { return d.name == winner.name}))
            result += Emoji.get('skull');
        result += `${winner.name} ${(this.newbieMode ? winner.getOriginalRole().fullName : winner.getOriginalRole().emoji)} ${Emoji.get('arrow_right')} ${(this.newbieMode ? winner.getRole().fullName : winner.getRole().emoji)}  ${Emoji.get('point_right')} ${winner.getKillTarget().name} \n`;
      });
      _.map(_.sortBy(this.losers, (loser: Player) => loser.getKillTarget().name), (loser: Player) => {
        result += `${Emoji.get('new_moon_with_face')}`;
        if(_.find(this.deathPlayers, (d: Player) => { return d.name == loser.name}))
            result += Emoji.get('skull');
        result += `${loser.name} ${(this.newbieMode ? loser.getOriginalRole().fullName : loser.getOriginalRole().emoji)} ${Emoji.get('arrow_right')} ${(this.newbieMode ? loser.getRole().fullName : loser.getRole().emoji)}  ${Emoji.get('point_right')} ${loser.getKillTarget().name} \n`;
      });

      result += `\n<b>${this.lang.getString("ACTION_STACK")}</b>\n`;
      result += _.map(this.actionStack, (step: ActionFootprint) => { return step.toDetailString() + "\n"; });

      this.msgInterface.sendMsg(result, { "parse_mode": "html" });
      console.log(`>> [${this.id}:Result]`, result);
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
      case RoleClass.COPYCAT: this.setPhase(Game.PHASE_WAKEUP_COPYCAT); break;
      case RoleClass.DOPPELGANGER: this.setPhase(Game.PHASE_WAKEUP_DOPPELGANGER); break;
      case RoleClass.WEREWOLF: this.setPhase(Game.PHASE_WAKEUP_WEREWOLF); break;
      case RoleClass.MINION: this.setPhase(Game.PHASE_WAKEUP_MINION); break;
      case RoleClass.MASON: this.setPhase(Game.PHASE_WAKEUP_MASON); break;
      case RoleClass.SEER: this.setPhase(Game.PHASE_WAKEUP_SEER); break;
      case RoleClass.ROBBER: this.setPhase(Game.PHASE_WAKEUP_ROBBER); break;
      case RoleClass.TROUBLEMAKER: this.setPhase(Game.PHASE_WAKEUP_TROUBLEMAKER); break;
      case RoleClass.DRUNK: this.setPhase(Game.PHASE_WAKEUP_DRUNK); break;
      case RoleClass.INSOMNIAC: this.setPhase(Game.PHASE_WAKEUP_INSOMNIAC); break;
    }
  }

  private sendInvalidActionMessage(msgId) {
    return this.msgInterface.showNotification(msgId, this.lang.getString("INVALID_ACTION"));
  }

  private viewPlayerRole(player, msg) {
    player.getRole().notifyRole(this.msgInterface, msg);
  }

  private handleAnnouncePlayerEvent(event: string, msg: any, player: Player) {
    switch (event) {
      case 'view_role': this.viewPlayerRole(player, msg); break;
      default: this.sendInvalidActionMessage(msg.id); break;
    }
  }

  private handleWakeUpEvent(event: string, msg: any, player: Player) {
    let footprint: ActionFootprint;
    if (player.getOriginalRole().checkRole([RoleClass.DOPPELGANGER])) { // The player is Doppelganger
      let role: any = player.getOriginalRole();
      let shadowRoleName: string = (role.shadowChoice ? role.shadowChoice.code.toLowerCase() : "");

      if (this.getPhase() == Game.PHASE_WAKEUP_DOPPELGANGER && !shadowRoleName) {
        //If (DOPPELGANGER and not picked), Okay
      }
      else if (this.getPhase() == 'wakeup_' + shadowRoleName && _.includes([Game.PHASE_WAKEUP_WEREWOLF, Game.PHASE_WAKEUP_MINION, Game.PHASE_WAKEUP_MASON, Game.PHASE_WAKEUP_INSOMNIAC], this.getPhase())) {
        //If (picked and correct phase) and within [Werewolf, Minion, Mason, Insomniac] phase, Okay
      }
      else {
        this.sendInvalidActionMessage(msg.id);
        return;
      }
    }
    else if (player.getOriginalRole().checkRole([RoleClass.COPYCAT])) { // The player is Copycat
      let role: any = player.getOriginalRole();
      let shadowRoleName: string = (role.shadowChoice ? role.shadowChoice.code.toLowerCase() : "");

      if (this.getPhase() == Game.PHASE_WAKEUP_COPYCAT && !shadowRoleName) {
        //If (COPYCAT and not picked), Okay
      }
      else if (this.getPhase() == 'wakeup_' + shadowRoleName) {
        //If (picked and correct phase), Okay
      }
      else
      {
        this.sendInvalidActionMessage(msg.id);
        return;
      }
    }
    else if (this.getPhase() !== 'wakeup_' + player.getOriginalRole().code.toLowerCase()) {
      this.sendInvalidActionMessage(msg.id);
      return;
    }

    footprint = player.getOriginalRole().useAbility(this.msgInterface, msg, this.players, this.table, player);

    if (footprint && footprint.action)
      if (_.filter(this.actionStack, (action: ActionFootprint) => (action.player.id === footprint.player.id && action.choice === footprint.choice)).length == 0)
        this.actionStack.push(footprint);
  }

  private handleConversationEvent(event: string, msg: any, player: Player) {
    if (event == "DOZED_WAKE_UP") {
      // command = "Dozed"
      let action: ActionFootprint = player.getOriginalRole().actionEvt;
      let rolePrefix: string = "";
      let actionMsg: string = "";

      if (action) {
        let role: any;

        if (action.player.getOriginalRole().code == RoleClass.DOPPELGANGER.code) {
          role = action.player.getOriginalRole();
          rolePrefix = role.emoji + role.shadowChoice.emoji + role.shadowChoice.name;
        }
        else
        {
          rolePrefix = action.player.getOriginalRole().fullName;
        }

        actionMsg = action.toString();
      }
      else {
        //  For those has no action Village, Tanner, Hunter
        rolePrefix = player.getOriginalRole().fullName;
        actionMsg = Emoji.get('zzz');
      }

      //this.msgInterface.showNotification(msg.id, `${rolePrefix}${action.toString()}`);
      this.msgInterface.showNotification(msg.id,
        (this.newbieMode ?
          `${this.lang.getString("DOZED_ROLE")}${rolePrefix}\n${this.lang.getString("DOZED_ACTION")}${actionMsg}` :
          `${rolePrefix} ${Emoji.get('arrow_right')} ${this.lang.getString("DOZED_ACTION")}${actionMsg}`
        )
      );
    }
    else if(event == "SHOWOKEN_TOOLS") {
      this.showToken(msg);
    }
    else if(event == "VOTE_TOOLS") {
      this.sendVotingList(msg);
    }
    else if (parseInt(event)) {
      //if the command = integer, it should be a Vote.
      this.handleVotingEvent(event, msg, player);
    }
    else {
      // unknown command
    }
  }

  private handleVotingEvent(event: string, msg: any, player: Player) {
    const id = parseInt(event);
    const target = player.getKillTarget();

    if (player.id === id) {
      return this.sendInvalidActionMessage(msg.id);
    }

    this.votePlayer(id, msg, player);
    // Update the list if the player is first time to vote
    if (!target && player.getKillTarget()) this.sendVotingList(msg);
    if (_.filter(this.players, (player) => !(player.getKillTarget())).length == 0 && this.votingResolve)
      this.votingResolve();
  }

  private randomVote(host: Player) {
    const targets = _.filter(this.players, player => player.id !== host.id);
    const pos = _.random(0, targets.length - 1);
    host.setKillTarget(targets[pos]);
  }

  private determineWinners(deathPlayers: Player[]) {
    let winners: Player[] = [];

    const deathTanners = _.filter(deathPlayers, player => player.getRole().checkRole([RoleClass.TANNER]));
    const deathWerewolfs = _.filter(deathPlayers, player => player.getRole().checkRole([RoleClass.WEREWOLF]));
    const deathVillages = _.filter(deathPlayers, player => _.indexOf([
      RoleClass.WEREWOLF.code, RoleClass.MINION.code, RoleClass.TANNER.code
    ], player.getRole().code) < 0);

    //console.log(`>> determineWinners.deathPlayers`, deathPlayers);
    console.log(`>> [${this.id}:determineWinners.deathPlayers]`, util.inspect(_.map(deathPlayers, (p: Player) => { return `${p.name}${p.role.emoji}${p.role.name}` }), { colors: true }));
    //console.log(`>> determineWinners.deathTanners`, deathTanners);
    console.log(`>> [${this.id}:determineWinners.deathTanners]`, util.inspect(_.map(deathTanners, (p: Player) => { return `${p.name}${p.role.emoji}${p.role.name}` }), { colors: true }));
    //console.log(`>> determineWinners.deathWerewolfs`, deathWerewolfs);
    console.log(`>> [${this.id}:determineWinners.deathWerewolfs]`, util.inspect(_.map(deathWerewolfs, (p: Player) => { return `${p.name}${p.role.emoji}${p.role.name}` }), { colors: true }));
    //console.log(`>> determineWinners.deathVillages`, deathVillages);
    console.log(`>> [${this.id}:determineWinners.deathVillages]`, util.inspect(_.map(deathVillages, (p: Player) => { return `${p.name}${p.role.emoji}${p.role.name}` }), { colors: true }));
    console.log(`>> [${this.id}:determineWinners.hasWerewolfOnTable()]`, this.hasWerewolfOnTable());

    // Tanner always win when he die
    winners = _.concat(winners, deathTanners);

    if (deathWerewolfs.length > 0) {
      // If any wolf is die, all Village win
      winners = _.concat(winners, this.getNonTannerVillagesTeam());
    } else if (this.hasWerewolfOnTable()) {
      // If no wolf is die, but tanner is alive, wolf win
      if (deathTanners.length === 0) {
        winners = _.concat(winners, this.getWerewolfTeam());
      }
    } else if (deathPlayers.length === 0) {
      // If no one die and there is no wolf, Village win
      winners = _.concat(winners, this.getNonTannerVillagesTeam());
    } else if (deathVillages.length > 0 && deathTanners.length === 0) {
      // If no wolf + Village/Tanner die, Minion will win
      winners = _.concat(winners, this.getWerewolfTeam());
    }

    return winners;
  }

  private getNonTannerVillagesTeam() {
    return _.filter(this.players, player => !(player.getRole().checkRole([RoleClass.WEREWOLF, RoleClass.MINION, RoleClass.TANNER])));
  }

  private getWerewolfTeam() {
    return _.filter(this.players, player => player.getRole().checkRole([RoleClass.WEREWOLF, RoleClass.MINION]));
  }

  private hasWerewolfOnTable() {
    const werewolfs = _.filter(this.players, player => player.getRole().checkRole([RoleClass.WEREWOLF]));
    return werewolfs.length > 0;
  }

  private votePlayer(id: number, msg, player) {
    let target = _.find(this.players, p => p.id === id && p.id != player.id);
    if (id == -1) target = new Player({id: -1, name: ""});
    let rtnMsg = "";
    if (target) {
      player.setKillTarget(target);
      rtnMsg = `${Emoji.get('arrow_right')} ${target.name}`;
    }
    else {
      rtnMsg = this.lang.getString("VOTE_ERROR");
    }

    this.msgInterface.showNotification(msg.id, rtnMsg, false);
  }

  private setCountDown(msg, totalTime, intervalArray, unit: string) {
    let timerArray: any[] = [];
    let ratio: number, startTime: number;
    switch (unit) {
      case "mins":
        ratio = 60 * 1000;
        break;
      case "sec":
        ratio = 1000;
        break;
      default:
        ratio = 1;
        break;
    }

    //console.log(`totalTime: `, totalTime);
    //console.log(`intervalArray: `, intervalArray);
    startTime = totalTime;
    while (intervalArray.length > 0) {
      let interval = intervalArray.shift();

      if (totalTime > interval) {
        timerArray.push({ time: startTime - interval, count: interval / ratio });
        startTime = interval;
      }
    }
    //console.log(`timerArray: `, timerArray);
    //return timerArray;
    if (timerArray.length > 0) this.countDown(msg, timerArray, unit);
  }

  private countDown(msg, timerArray: any[], unit: string) {
    if (!timerArray) return;
    let interval = timerArray.shift();
    this.votingTimer = setTimeout(() => {
      this.msgInterface.sendMsg(this.lang.getString("COUNT_DOWN") + interval.count + " " + unit + "...");
      if (timerArray.length > 0) this.countDown(msg, timerArray, unit);
    }, interval.time);
  }
  
  private getGameRole(): Role[] {
    if (!this.isStarted()) return;

    let roles: Role[] = [];
    let role: string[] = [];
    _.map(this.players, (p: Player) => {
      roles.push(p.getOriginalRole());
    });
    _.map(this.table.getRoles(), (r: Role) => {
      roles.push(r);
    });

    return _.sortBy(roles, (r: Role) => r.ordering);
  }
}