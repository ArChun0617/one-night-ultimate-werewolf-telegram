import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

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
    let rtnActionEvt: ActionFootprint;
    let rtnMsg: string = "";

    if (msg.data == "WAKE_UP") {
      this.choice = rtnMsg = this.getRolePlayers(this.name, players);
      rtnMsg = (rtnMsg || `[${this.fullName} not exists]`);
      rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
    }
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";

    if (!this.choice) {
      this.choice = rtnMsg = this.getRolePlayers(this.name, players);
      rtnMsg = (rtnMsg || `[${this.fullName} not exists]`);

      bot.answerCallbackQuery(msg.id, rtnMsg);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
      return this.actionEvt;
    }
  }

  private getRolePlayers(role: string, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole(role));
    rtnMsg = _.map(target, (player: Player) => this.emoji + player.name).join(" ");

    return rtnMsg;
  }
}
