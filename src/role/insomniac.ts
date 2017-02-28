import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Insomniac extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.INSOMNIAC_EMOJI,
      name: Role.INSOMNIAC
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // sendMessage [view] click to know the final role
    const key = [
      [{ text: "Wake Up", callback_data: "WAKE_UP" }]
    ];

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
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
    const target: Player = _.find(players, (player: Player) => player.id == msg.from.id);

    if (msg.data == "WAKE_UP")
      rtnMsg = target.name + " is: " + target.getRole().fullName;

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";
    const target: Player = _.find(players, (player: Player) => player.id == msg.from.id);

    if (msg.data == "WAKE_UP")
      rtnMsg = target.name + " is: " + target.getRole().fullName;

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
