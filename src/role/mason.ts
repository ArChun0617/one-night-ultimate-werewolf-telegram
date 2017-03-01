import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Mason extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.MASON_EMOJI,
      name: Role.MASON
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // notify buddies
    const key = [];

    key.push([{ text: "Wake Up", callback_data: "WAKE_UP" }]);

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players) {
    console.log(`${this.name} useAbility:`, msg);

    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.MASON);
    let rtnMsg: string = "";

    if (msg.data == "WAKE_UP") {
      _.map(target, (player: Player) => {
        rtnMsg += player.name + ", ";
      });

      if (rtnMsg.length > 0) {
        this.choice = rtnMsg.substr(0, rtnMsg.length - 2);
        rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";

    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.MASON);
    _.map(target, (player: Player) => {
      rtnMsg += player.name + ", ";
    });

    if (rtnMsg.length > 0) {
      this.choice = rtnMsg.substr(0, rtnMsg.length - 2);
      rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
