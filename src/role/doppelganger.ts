import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Doppelganger extends Role implements RoleInterface {
  shadowChoice: Role;
  choice: string;

  constructor() {
    super({
      emoji: Role.DOPPELGANGER_EMOJI,
      name: Role.DOPPELGANGER,
      ordering: 10
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // clone a user
    // apply that role ability

    /*const key = [];
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

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up. Choose a player to copy his role.\n If you are ${Role.SEER_EMOJI}${Role.ROBBER_EMOJI}${Role.TROUBLEMAKER_EMOJI}${Role.DRUNK_EMOJI}, do your action now.\nIf you are ${Role.WEREWOLF_EMOJI}${Role.MINION_EMOJI}${Role.MASON_EMOJI}${Role.INSOMNIAC_EMOJI}, wait until their turn.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        //console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });*/
  }

  /*useAbility(bot, msg, players, table, host) {
    let rtnMsg = '';
    let target: any;
    let actionEvt: any;
    console.log(`${this.name} useAbility.${(this.shadowChoice ? this.shadowChoice.name : this.name)}: ${msg.data}`);
    console.log(`${this.name} useAbility.choice: ${this.choice}`);

    switch (this.shadowChoice ? this.shadowChoice.name : "") {
      case Role.WEREWOLF:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(Role.WEREWOLF, players);
          if (rtnMsg.length > 0) rtnMsg = `${Role.WEREWOLF_EMOJI} is: ` + rtnMsg;
        }
        break;
      case Role.MINION:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(Role.WEREWOLF, players);
          if (rtnMsg.length > 0) rtnMsg = `${Role.WEREWOLF_EMOJI} is: ` + rtnMsg;
        }
        break;
      case Role.MASON:
        if (msg.data == "WAKE_UP") {
          this.choice = rtnMsg = this.getRolePlayers(Role.MASON, players);
          if (rtnMsg.length > 0) rtnMsg = `${Role.MASON_EMOJI} is: ` + rtnMsg;
        }
        break;
      case Role.SEER:
        if (!this.choice) {
          if (/^\d+$/.test(msg.data) || _.includes(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data)) {
            this.choice = msg.data;
            rtnMsg = this.watchRole(this.choice, host, table);
            actionEvt = this.actionLog("useAbility", host, this.choice, rtnMsg);
          }
        }
        else
          rtnMsg = "You already make your choice.";
        break;
      case Role.ROBBER:
        if (!this.choice) {
          this.choice = msg.data;
          rtnMsg = this.swapPlayer(this.choice, host, players);
          actionEvt = this.actionLog("useAbility", host, this.choice, rtnMsg);
        }
        else
          rtnMsg = "You already make your choice.";
        break;
      case Role.TROUBLEMAKER:
        const regex = new RegExp(/^\d+_\d+/);
        if (regex.test(this.choice)) {
          //Already chose both player
          rtnMsg = "You already make your choice.";
        }
        else if (this.choice) {
          //Chose only 1 player
          if (host.id == parseInt(msg.data)) {
            rtnMsg = "Buddy, You cannot choose yourself.";
          }
          else if (this.choice == msg.data) {
            this.choice = "";
            rtnMsg = "You have cancelled, choose 2 players to swap.";
          }
          else {
            this.choice += "_" + msg.data;
            rtnMsg = this.swapPlayers(this.choice, players);
            actionEvt = this.actionLog("useAbility", host, this.choice, rtnMsg);
          }
        }
        else {
          //Both not yet chose, now set the first player.
          if (host.id == parseInt(msg.data)) {
            rtnMsg = "Buddy, You cannot choose yourself.";
          }
          else {
            this.choice = msg.data;
            const target: Player = _.find(players, (player: Player) => player.id == parseInt(this.choice));
            rtnMsg = `You have choose ${target.name}, choose 1 more player to swap.`;
          }
        }
        break;
      case Role.DRUNK:
        if (!this.choice) {
          if (_.includes(["CARD_A", "CARD_B", "CARD_C"], msg.data)) {
            this.choice = msg.data;
            rtnMsg = this.swapTable(this.choice, host, table);
            actionEvt = this.actionLog("useAbility", host, this.choice, rtnMsg);
          }
        }
        else
          rtnMsg = "You already make your choice.";
        break;
      case Role.INSOMNIAC:
        if (msg.data == "WAKE_UP") {
          this.choice = host.getRole().name;
          rtnMsg = host.name + " is: " + host.getRole().fullName;
        }
        break;
      case "":
        target = _.find(players, (player: Player) => player.id == parseInt(msg.data));
        //console.log(`${this.name} useAbility.target:`, target);
        if (target) {
          this.shadowChoice = _.clone(target.getRole());
          //console.log(`${this.name} useAbility.target.getRole():`, target.getRole());
          //console.log(`${this.name} useAbility.shadowChoice:`, this.shadowChoice);
          console.log(`${this.name} useAbility.Assign: ${this.shadowChoice.name}`);
          this.emoji += this.shadowChoice.emoji;
          rtnMsg = target.name + " : " + target.getRole().fullName;
        }
        break;
      default:
        break;
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
    return (actionEvt || this.actionLog("useAbility", host, this.choice, ""));
  }*/

  /*endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";
    let actionEvt: any;

    console.log(`${this.name} endTurn:shadowChoice ${(this.shadowChoice ? this.shadowChoice.name : "undefined")}`);
    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (this.shadowChoice) {
      switch (this.shadowChoice ? this.shadowChoice.name : "") {
        case Role.WEREWOLF:
          //do nothing
          break;
        case Role.MINION:
          //do nothing
          break;
        case Role.MASON:
          //do nothing
          break;
        case Role.SEER:
          //do nothing
          break;
        case Role.ROBBER:
          if (!this.choice) {
            const key = _.map(players, (player: Player) => player.id + "");
            this.choice = _.shuffle(key)[0];
            console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
            rtnMsg = this.swapPlayer(this.choice, host, players);
            actionEvt = this.actionLog("endTurn", host, this.choice, `${Emoji.get('zzz')}  ` + rtnMsg);
          }
          break;
        case Role.TROUBLEMAKER:
          const regex = new RegExp(/^\d_\d/);
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

            console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
            rtnMsg = this.swapPlayers(this.choice, players);
            actionEvt = this.actionLog("endTurn", host, this.choice, `${Emoji.get('zzz')}  ` + rtnMsg);
          }
          else {
            const key = _.map(players, (player: Player) => player.id + "");
            targets = _.filter(key, (k) => k !== host.id); // not host
            targets = _.shuffle(targets);
            this.choice = targets.pop() + "_" + targets.pop();

            console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
            rtnMsg = this.swapPlayers(this.choice, players);
            actionEvt = this.actionLog("endTurn", host, this.choice, `${Emoji.get('zzz')}  ` + rtnMsg);
          }
          break;
        case Role.DRUNK:
          if (!this.choice) {
            this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
            console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
            rtnMsg = this.swapTable(this.choice, host, table);
            actionEvt = this.actionLog("endTurn", host, this.choice, `${Emoji.get('zzz')}  ` + rtnMsg);
          }
          break;
        case Role.INSOMNIAC:
          //do nothing
          break;
        case "":
          //do nothing
          break;
        default:
          break;
      }

      bot.answerCallbackQuery(msg.id, rtnMsg);
      return (actionEvt || this.actionLog("endTurn", host, this.choice, ""));
    }
  }*/

  checkRole(roleName, chkDoppleGanger: boolean = true) {
     //chkShadow is deduce use shadowChoice or real role(DoppleGanger)

    if (!(roleName instanceof Array) && roleName.toUpperCase() == Role.DOPPELGANGER.toUpperCase())// If role checked is DoppleGanger, always true for this
      return true;
    else if (roleName instanceof Array) // Otherwise check depends on chkShadow
      return _.includes(_.map(roleName, (r) => r.toUpperCase()), (chkDoppleGanger ? (this.shadowChoice ? this.shadowChoice.name : this.name) : this.name).toUpperCase());
    else
      return (chkDoppleGanger ? (this.shadowChoice ? this.shadowChoice.name : this.name) : this.name).toUpperCase() == roleName.toUpperCase();
  }

  // Werewolf, Minion, Mason Handler
  private getRolePlayers(role: string, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole(role));
    rtnMsg = _.map(target, (player: Player) => this.emoji + player.name).join(" ");

    return rtnMsg;
  }

  // Seer Handler
  private watchRole(picked: string, players, table) {
    console.log(`${this.name} watchRole: ${picked}`);
    let rtnMsg = "";

    const target: Player = _.find(players, (player: Player) => player.id == parseInt(picked));

    if (target) {
      // if target to a specific guy
      rtnMsg = target.name + " : " + target.getRole().fullName;
    }
    else {
      switch (picked) {
        case 'CARD_AB':
          rtnMsg = `[${table.getLeft().fullName}] [${table.getCenter().fullName}] [${Emoji.get('question')}]`;
          break;
        case 'CARD_AC':
          rtnMsg = `[${table.getLeft().fullName}] [${Emoji.get('question')}] [${table.getRight().fullName}]`;
          break;
        case 'CARD_BC':
          rtnMsg = `[${Emoji.get('question')}] [${table.getCenter().fullName}] [${table.getRight().fullName}]`;
          break;
        default:
          break;
      }
    }

    return rtnMsg;
  }

  // Robber Handler
  private swapPlayer(picked: string, host, players) {
    console.log(`${this.name} swapPlayer: ${picked}`);
    let tableRole: Role;
    let rtnMsg = "";
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(this.choice));

    if (host && target) {
      // swap the role
      rtnMsg = target.name + " : " + target.getRole().fullName;
      if (host.id != target.id) host.swapRole(target);
    }
    return rtnMsg;
  }

  // Troublemaker Handler
  private swapPlayers(picked: string, players) {
    console.log(`${this.name} swapPlayers: ${picked}`);
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
    console.log(`${this.name} swapTable: ${picked}`);

    let tableRole: Role;
    let rtnMsg = "";

    switch (picked) {
      case "CARD_A":
        tableRole = table.getLeft();
        table.setLeft(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "left";
        break;
      case "CARD_B":
        tableRole = table.getCenter();
        table.setCenter(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "centre";
        break;
      case "CARD_C":
        tableRole = table.getRight();
        table.setRight(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "right";
        break;
      default:
        rtnMsg = "Invalid action";
        break;
    }

    return rtnMsg;
  }
}
