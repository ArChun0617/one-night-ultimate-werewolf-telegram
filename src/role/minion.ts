import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Werewolf } from "./werewolf";
import { Player } from "../player/player";

export class Minion extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.MINION_EMOJI,
      name: Role.MINION
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // notify werewolf buddies
    const key = [];

    key.push([{ text: "Wake Up", callback_data: "WAKE_UP" }]);

    let wolf: Werewolf = new Werewolf();
    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up. '${wolf.emoji}${wolf.name}', stick out your thumb so the Minion can see who you are.`, {
    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  useAbility(bot, msg, players) {
    console.log(`${this.name} useAbility:`, msg);

    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF);
    let wolf: Werewolf = new Werewolf();
    let rtnMsg: string = "";

    _.map(target, (player: Player) => {
      rtnMsg += player.name + ", ";
    });

    if (rtnMsg.length > 0)
      rtnMsg = `${wolf.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {

  }
}
