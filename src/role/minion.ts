import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Minion extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.MINION_EMOJI,
      name: Role.MINION,
      ordering: 30
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // notify werewolf buddies
    const key = [
      [{ text: `Wake Up${Emoji.get('eyes')}`, callback_data: "WAKE_UP" }]
    ];

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up. '${wolf.emoji}${wolf.name}', stick out your thumb so the Minion can see who you are.`, {
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
    rtnMsg = this.getRolePlayers(Role.WEREWOLF, players);
    this.choice = rtnMsg;
    if (rtnMsg.length > 0) rtnMsg = `${Role.WEREWOLF + Role.WEREWOLF_EMOJI} is: ` + rtnMsg;
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return this.actionLog("useAbility", host, this.choice);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg: string = "";
    this.choice = rtnMsg;
    if (rtnMsg.length > 0) rtnMsg = `${Role.WEREWOLF + Role.WEREWOLF_EMOJI} is: ` + rtnMsg;
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return this.actionLog("endTurn", host, this.choice);
  }

  private getRolePlayers(role: string, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole(role));
    rtnMsg = _.map(target, (player: Player) => player.name).join();

    return rtnMsg;
  }

  actionLog(phase, host, choice) {
    return super.footprint(host, choice, "");
  }
}
