import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface, RoleClass, RoleClassInterface } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Doppelganger extends Role implements RoleInterface {
  shadowChoice: Role;
  choice: string;

  constructor() {
    super(RoleClass.DOPPELGANGER);
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.code} wake up called`);
    // clone a user
    // apply that role ability

    const key = [];
    let pos = 0;
    let btnPerLine = 3;

    _.map(players, (player: Player) => {
      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    key.push([
      { text: `${this.emoji}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_AB" },
      { text: `${this.emoji}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_AC" },
      { text: `${Emoji.get('question')}${this.emoji}${this.emoji}`, callback_data: "CARD_BC" }
    ]);

    key.push([
      { text: `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`, callback_data: "CARD_A" },
      { text: `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_B" },
      { text: `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_C" }
    ]);

    bot.editAction(this.fullName + this.lang.getString("ROLE_WAKE_UP") + this.lang.getString("ROLE_WAKE_UP_COPYCAT"), {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.code} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    let rtnMsg = '';
    let target: any;
    let rtnActionEvt: ActionFootprint;
    console.log(`${this.code} useAbility.${(this.shadowChoice ? this.shadowChoice.code : this.code)}: ${msg.data}`);
    console.log(`${this.code} useAbility.choice: ${this.choice}`);

    switch (this.shadowChoice ? this.shadowChoice.code : "") {
      case RoleClass.WEREWOLF.code:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
          rtnMsg = this.lang.getString(RoleClass.WEREWOLF.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
        break;
      case RoleClass.MINION.code:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
          rtnMsg = this.lang.getString(RoleClass.WEREWOLF.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
        break;
      case RoleClass.MASON.code:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.MASON, players);
          rtnMsg = this.lang.getString(RoleClass.MASON.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
        break;
      case RoleClass.SEER.code:
        if (!this.choice) {
          if (/^\d+$/.test(msg.data) || _.includes(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data)) {
            this.choice = msg.data;
            rtnMsg = this.watchRole(this.choice, players, table);

            if (_.includes(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data))
              rtnMsg = this.lang.getString("ROLE_ACTION_WATCH_TABLE") + rtnMsg;
            else
              rtnMsg = this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;

            rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
          }
        }
        else
          rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
        break;
      case RoleClass.ROBBER.code:
        if (!this.choice) {
          this.choice = msg.data;
          rtnMsg = this.swapPlayer(this.choice, host, players);
          rtnMsg = this.lang.getString("ROLE_ACTION_ROBBER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
        else
          rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
        break;
      case RoleClass.TROUBLEMAKER.code:
        const regex = new RegExp(/^\d+_\d+/);
        if (regex.test(this.choice)) {
          //Already chose both player
          rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
        }
        else if (this.choice) {
          //Chose only 1 player
          if (host.id == parseInt(msg.data)) {
            rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_ERROR");
          }
          else if (this.choice == msg.data) {
            this.choice = "";
            rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_CANCEL");
          }
          else {
            this.choice += "_" + msg.data;
            rtnMsg = this.swapPlayers(this.choice, players);
            rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
          }
        }
        else {
          //Both not yet chose, now set the first player.
          if (host.id == parseInt(msg.data)) {
            rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_ERROR");
          }
          else {
            this.choice = msg.data;
            const target: Player = _.find(players, (player: Player) => player.id == parseInt(this.choice));
            rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_FIRST") + target.name;
          }
        }
        break;
      case RoleClass.DRUNK.code:
        if (!this.choice) {
          if (_.includes(["CARD_A", "CARD_B", "CARD_C"], msg.data)) {
            this.choice = msg.data;
            rtnMsg = this.swapTable(this.choice, host, table);
            rtnMsg = this.lang.getString("ROLE_ACTION_WATCH_TABLE") + rtnMsg;
            rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
          }
        }
        else
          rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
        break;
      case RoleClass.INSOMNIAC.code:
        if (msg.data == "WAKE_UP") {
          this.choice = host.getRole().name;
          rtnMsg = host.getRole().fullName;
          rtnMsg = this.lang.getString("ROLE_ACTION_INSOMNIAC") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
        break;
      case "":
        if (host.id == parseInt(msg.data)) {
          rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_ERROR");
        }
        else
        {
          target = _.find(players, (player: Player) => player.id == parseInt(msg.data));
          if (target) {
            this.shadowChoice = _.clone(target.getRole());
            console.log(`${this.code} useAbility.Assign: ${this.shadowChoice.name}`);
            
            rtnMsg = `${target.name} : ${target.getRole().fullName}`;
            rtnMsg = this.lang.getString("ROLE_ACTION_DOPPELGANGER") + rtnMsg;
            rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, `cloned ${target.getRole().emoji}${target.name}`);
          }
        }
        break;
      default:
        break;
    }

    bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.code} endTurn`);
    let rtnMsg = "";
    let rtnActionEvt: ActionFootprint;

    console.log(`${this.code} endTurn:shadowChoice ${(this.shadowChoice ? this.shadowChoice.code : "undefined")}`);
    console.log(`${this.code} endTurn:choice ${this.choice}`);
    switch (this.shadowChoice ? this.shadowChoice.code : "") {
      case RoleClass.WEREWOLF.name:
        if (!this.choice) {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
          rtnMsg = this.lang.getString(RoleClass.WEREWOLF.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
        }
        break;
      case RoleClass.MINION.code:
        if (!this.choice) {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
          rtnMsg = this.lang.getString(RoleClass.WEREWOLF.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.MASON.code:
        if (!this.choice) {
          this.choice = rtnMsg = this.getRolePlayers(RoleClass.MASON, players);
          rtnMsg = this.lang.getString(RoleClass.MASON.code) + this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.SEER.code:
        if (!this.choice) {
          const key = ["CARD_AB", "CARD_AC", "CARD_BC"];

          _.map(players, (player: Player) => {
            if (player.id !== host.id)
              key.push(player.id + "");
          });

          this.choice = _.shuffle(key)[0];
          console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
          rtnMsg = this.watchRole(this.choice, players, table);

          if (_.includes(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data))
            rtnMsg = this.lang.getString("ROLE_ACTION_WATCH_TABLE") + rtnMsg;
          else
            rtnMsg = this.lang.getString("ROLE_ACTION_ROLE_PLAYER") + rtnMsg;

          bot.showNotification(msg.id, rtnMsg);
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.ROBBER.code:
        if (!this.choice) {
          const key = _.map(players, (player: Player) => player.id + "");
          this.choice = _.shuffle(key)[0];
          console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
          rtnMsg = this.swapPlayer(this.choice, host, players);
          rtnMsg = this.lang.getString("ROLE_ACTION_ROBBER") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.TROUBLEMAKER.code:
        const regex = new RegExp(/^\d+_\d+/);
        let targets: string[];
        if (regex.test(this.choice)) {
          //Already chose both player
          //do nothing
        }
        else if (this.choice) {
          const key = _.map(players, (player: Player) => player.id + "");
          //Random second player
          targets = _.filter(key, (k) => k !== host.id); // not host
          this.choice += "_" + _.shuffle(targets)[0];

          console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
          rtnMsg = this.swapPlayers(this.choice, players);
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        else {
          const key = _.map(players, (player: Player) => player.id + "");
          targets = _.filter(key, (k) => k !== host.id); // not host
          targets = _.shuffle(targets);
          this.choice = targets.pop() + "_" + targets.pop();

          console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
          rtnMsg = this.swapPlayers(this.choice, players);
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.DRUNK.code:
        if (!this.choice) {
          this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
          console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
          rtnMsg = this.swapTable(this.choice, host, table);
          rtnMsg = this.lang.getString("ROLE_ACTION_WATCH_TABLE") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case RoleClass.INSOMNIAC.code:
        if (!this.choice) {
          this.choice = host.getRole().name;
          rtnMsg = host.getRole().fullName;
          rtnMsg = this.lang.getString("ROLE_ACTION_INSOMNIAC") + rtnMsg;
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
        }
        break;
      case "":
        //do nothing
        console.log(`${this.code} endTurn:choice_Shuffle_empty zzz`);
        rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, `${Emoji.get('zzz')}`, true);
        break;
      default:
        break;
    }

    //bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  checkRole(roleName: RoleClassInterface[], chkShadow: boolean = true) {
    if (roleName.length == 1 && roleName[0].code == RoleClass.DOPPELGANGER.code)
      return true;
    else
      return !!(_.find(roleName, { code: (chkShadow ? (this.shadowChoice ? this.shadowChoice.code : this.code) : this.code) }));
  }

  // Werewolf, Minion, Mason Handler
  private getRolePlayers(role: RoleClassInterface, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole([role]));
    rtnMsg = _.map(target, (player: Player) => role.emoji + player.name).join(" ");

    return rtnMsg;
  }

  // Seer Handler
  private watchRole(picked: string, players, table) {
    console.log(`${this.code} watchRole: ${picked}`);
    let rtnMsg = "";

    const target: Player = _.find(players, (player: Player) => player.id == parseInt(picked));

    if (target) {
      // if target to a specific guy
      rtnMsg = `${target.getRole().emoji}${target.name}`;
    }
    else {
      switch (picked) {
        case 'CARD_AB':
          rtnMsg = `${table.getLeft().fullName}${table.getCenter().fullName}${Emoji.get('question')}`;
          break;
        case 'CARD_AC':
          rtnMsg = `${table.getLeft().fullName}${Emoji.get('question')}${table.getRight().fullName}`;
          break;
        case 'CARD_BC':
          rtnMsg = `${Emoji.get('question')}${table.getCenter().fullName}${table.getRight().fullName}`;
          break;
        default:
          break;
      }
    }

    return rtnMsg;
  }

  // Robber Handler
  private swapPlayer(picked: string, host, players) {
    console.log(`${this.code} swapPlayer: ${picked}`);
    let tableRole: Role;
    let rtnMsg = "";
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(this.choice));

    if (host && target) {
      // swap the role
      rtnMsg = `${target.name} ${target.getRole().fullName}`;
      if (host.id != target.id) host.swapRole(target);
    }
    return rtnMsg;
  }

  // Troublemaker Handler
  private swapPlayers(picked: string, players) {
    console.log(`${this.code} swapPlayers: ${picked}`);
    let tableRole: Role;
    let rtnMsg = "";
    let chosenPlayer = picked.split('_');

    //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
    const host: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[0]));
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[1]));

    if (host && target) {
      // swap the role
      rtnMsg = host.name + `${Emoji.get('arrows_counterclockwise')}` + target.name;
      host.swapRole(target);
    }
    return rtnMsg;
  }

  // Drunk Handler
  private swapTable(picked: string, host, table) {
    console.log(`${this.code} swapTable: ${picked}`);
    let tableRole: Role;
    let rtnMsg = "";

    switch (picked) {
      case "CARD_A":
        tableRole = table.getLeft();
        table.setLeft(host.getRole());
        host.setRole(tableRole);

        rtnMsg += `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`;
        break;
      case "CARD_B":
        tableRole = table.getCenter();
        table.setCenter(host.getRole());
        host.setRole(tableRole);

        rtnMsg += `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`;
        break;
      case "CARD_C":
        tableRole = table.getRight();
        table.setRight(host.getRole());
        host.setRole(tableRole);

        rtnMsg += `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`;
        break;
      default:
        rtnMsg = this.lang.getString("ROLE_INVALID_ACTION");
        break;
    }

    return rtnMsg;
  }
}
