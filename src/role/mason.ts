import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Mason extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.MASON_EMOJI,
      name: Role.MASON,
      ordering: 40
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // notify buddies
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
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);
    let rtnMsg: string = "";

    if (msg.data == "WAKE_UP") {
      rtnMsg = this.getRolePlayers(this.name, players);
      this.choice = rtnMsg;
      if (rtnMsg.length > 0) rtnMsg = `${this.fullName} is: ` + rtnMsg;
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";

    rtnMsg = this.getRolePlayers(this.name, players);
    this.choice = rtnMsg;
    if (rtnMsg.length > 0) rtnMsg = `${this.fullName} is: ` + rtnMsg;

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  private getRolePlayers(role: string, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole(role));
    rtnMsg = _.map(target, (player: Player) => player.name).join();

    return rtnMsg;
  }
}
