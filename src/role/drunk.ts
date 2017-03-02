import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Drunk extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.DRUNK_EMOJI,
      name: Role.DRUNK
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // sendMessage [left] [center] [right], choose one of the center card to exchange

    const key = [
      [
        { text: "Left", callback_data: "CARD_A" },
        { text: "Middle", callback_data: "CARD_B" },
        { text: "Right", callback_data: "CARD_C" }
      ]
    ];
    
    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} useAbility:`, msg);
    let rtnMsg = '';

    if (this.choice) {
      rtnMsg = "You already make your choice.";
    }
    else {
      this.choice = msg.data

      if (_.some(["CARD_A", "CARD_B", "CARD_C"], this.choice))
        rtnMsg = this.swapTable(this.choice, host, table);
      else
        rtnMsg = "Invalid action";
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";

    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
      console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapTable(this.choice, host, table);

      bot.answerCallbackQuery(msg.id, rtnMsg);
    }
  }

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
