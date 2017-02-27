import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Drunk extends Role {
  constructor() {
    super({
      emoji: Role.DRUNK_EMOJI,
      name: Role.DRUNK
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [left] [center] [right], choose one of the center card to exchange

    const key = [
      [{ text: "Left", callback_data: "CARD_A" }, { text: "Middle", callback_data: "CARD_B" }, {
        text: "Right",
        callback_data: "CARD_C"
      }]
    ];

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.`, {
    bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  useAbility(bot, msg, players, table) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} useAbility:`, msg);

    let rtnMsg: string = "";
    let tableRole: Role;
    const host: Player = _.find(players, (player: Player) => player.id == parseInt(msg.from.id));

    if (msg.data == "CARD_A" || msg.data == "CARD_B" || msg.data == "CARD_C") {
      rtnMsg = "You have swapped with ";
      let targetRole: Role;

      if (msg.data == "CARD_A") {
        tableRole = table.getLeft();
        table.setLeft(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "left";
      }
      else if (msg.data == "CARD_B") {
        tableRole = table.getCenter();
        table.setCenter(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "centre";
      }
      else if (msg.data == "CARD_C") {
        tableRole = table.getRight();
        table.setRight(host.getRole());
        host.setRole(tableRole);

        rtnMsg += "right";
      }
      else {
        rtnMsg = "Invalid action";
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
