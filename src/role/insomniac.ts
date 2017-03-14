import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Insomniac extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.INSOMNIAC_EMOJI,
      name: Role.INSOMNIAC,
      ordering: 90
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // sendMessage [view] click to know the final role
    const key = [
      [{ text: `Wake Up${Emoji.get('eyes')}`, callback_data: "WAKE_UP" }]
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
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);

    let rtnMsg: string = "";

    if (msg.data == "WAKE_UP") {
      rtnMsg = host.name + " is: " + host.getRole().fullName;
      this.choice = host.getRole().name;
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
    return super.footprint(host, "", "");
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";
    rtnMsg = host.name + " is: " + host.getRole().fullName;
    this.choice = host.getRole().name;
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return super.footprint(host, "", "");
  }
}
