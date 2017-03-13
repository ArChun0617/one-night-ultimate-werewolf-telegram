import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Doppelganger extends Role implements RoleInterface {
  shadowChoice: string = "";
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

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    let rtnMsg = '';
    let target:any;
    console.log(`${this.name} useAbility:`, msg);
    console.log(`${this.name} useAbility:shadowChoice ${this.shadowChoice}`);

    if (this.choice) {
      rtnMsg = "You already make your choice.";
    }
    else {
      switch (this.shadowChoice) {
        case Role.WEREWOLF:
          target = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF || (player.getOriginalRole().shadowChoice && player.getOriginalRole().shadowChoice == Role.WEREWOLF));
          if (msg.data == "WAKE_UP") {
            _.map(target, (player: Player) => {
              rtnMsg += player.name + ", ";
            });

            if (rtnMsg.length > 0)
              rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
          }
          break;
        case Role.MINION:
          target = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF || (player.getOriginalRole().shadowChoice && player.getOriginalRole().shadowChoice == Role.WEREWOLF));
          if (msg.data == "WAKE_UP") {
            _.map(target, (player: Player) => {
              rtnMsg += player.name + ", ";
            });

            if (rtnMsg.length > 0)
              rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
          }
          break;
        case Role.MASON:
          target = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.MASON || (player.getOriginalRole().shadowChoice && player.getOriginalRole().shadowChoice == Role.MASON));
          if (msg.data == "WAKE_UP") {
            _.map(target, (player: Player) => {
              rtnMsg += player.name + ", ";
            });

            if (rtnMsg.length > 0)
              rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
          }
          break;
        case Role.SEER:
          if (/^\d+$/.test(msg.data) || _.some(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data)) {
            this.choice = msg.data;
            rtnMsg = this.swapTable(this.choice, host, table);
          }
          break;
        case Role.ROBBER:
          this.choice = msg.data;
          rtnMsg = this.swapPlayer(this.choice, host, players);
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
            }
          }
          else {
            //Both not yet chose, now set the first player.
            if (host.id == parseInt(msg.data)) {
              rtnMsg = "Buddy, You cannot choose yourself.";
            }
            else {
              this.choice = msg.data;
              const target: Player = _.find(players, (player: Player) => player.id == msg.data);
              rtnMsg = `You have choose ${target.name}, choose 1 more player to swap.`;
            }
          }
          break;
        case Role.DRUNK:
          if (_.some(["CARD_A", "CARD_B", "CARD_C"], this.choice)) {
            this.choice = msg.data;
            rtnMsg = this.swapTable(this.choice, host, table);
          }
          break;
        case Role.INSOMNIAC:
          if (msg.data == "WAKE_UP") {
            this.choice = host.getRole().name;
            rtnMsg = host.name + " is: " + host.getRole().fullName;
          }
          break;
        case "":
          target = _.find(players, (player: Player) => player.id == parseInt(msg.data));
          if (target) {
            this.shadowChoice = target.getRole().name;
            rtnMsg = target.name + " : " + target.getRole().fullName;
          }
          break;
        default:
          break;
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    // do nothing
  }

  // Seer Handler
  private watchRole(picked: string, players, table) {
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
    let tableRole: Role;
    let rtnMsg = "";

    if (this.choice == "CARD_A" || this.choice == "CARD_B" || this.choice == "CARD_C") {
      rtnMsg = "You have swapped with ";
      let targetRole: Role;

      if (this.choice == "CARD_A") {
        tableRole = table.getLeft();
        table.setLeft(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "left";
      }
      else if (this.choice == "CARD_B") {
        tableRole = table.getCenter();
        table.setCenter(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "centre";
      }
      else if (this.choice == "CARD_C") {
        tableRole = table.getRight();
        table.setRight(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "right";
      }
      else {
        rtnMsg = "Invalid action";
      }
    }
    return rtnMsg;
  }
}
