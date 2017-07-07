import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface, RoleClass } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Drunk extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super(RoleClass.DRUNK);
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.code} wake up called`);
    // sendMessage [left] [center] [right], choose one of the center card to exchange

    const key = [
      [
        { text: `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`, callback_data: "CARD_A" },
        { text: `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_B" },
        { text: `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_C" }
      ]
    ];
    
    bot.editAction(this.fullName + this.lang.getString("ROLE_WAKE_UP"), {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.code} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.code} useAbility.msg.data: ${msg.data}`);
    let rtnActionEvt: ActionFootprint;
    let rtnMsg = '';

    if (this.choice) {
      rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
    }
    else {
      if (!_.includes(["CARD_A", "CARD_B", "CARD_C"], msg.data))
        rtnMsg = this.lang.getString("ROLE_INVALID_ACTION");
      else {
        this.choice = msg.data;
        rtnMsg = this.swapTable(this.choice, host, table);
        rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
      }
    }

    bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.code} endTurn`);
    let rtnMsg = "";

    console.log(`${this.code} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
      console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapTable(this.choice, host, table);

      //bot.showNotification(msg.id, rtnMsg);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
      return this.actionEvt;
    }
  }

  private swapTable(picked: string, host, table) {
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

  /*actionLog(choice) {
    let actionMsg = "";

    if (this.choice == "CARD_A")
      actionMsg += `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`;
    else if (this.choice == "CARD_B")
      actionMsg += `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`;
    else if (this.choice == "CARD_C")
      actionMsg += `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`;

    return actionMsg;
  }*/
}
