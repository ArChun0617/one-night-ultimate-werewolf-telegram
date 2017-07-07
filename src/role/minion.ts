import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface, RoleClass, RoleClassInterface } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Minion extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super(RoleClass.MINION);
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.code} wake up called`);
    // notify werewolf buddies
    const key = [
      [{ text: this.lang.getString("ROLE_ACTION_WAKE_UP"), callback_data: "WAKE_UP" }]
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
    console.log(`${this.code} useAbility.msg.data: ${msg.data}`);
    let rtnActionEvt: ActionFootprint;
    let rtnMsg: string = "";

    if (msg.data == "WAKE_UP") {
      this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
      rtnMsg = (rtnMsg || `[${RoleClass.WEREWOLF.emoji}${this.lang.getString("ROLE_ACTION_ROLE_NOT_EXISTS")}]`);
      rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
    }
    bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.code} endTurn`);
    let rtnMsg: string = "";

    if (!this.choice) {
      this.choice = rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
      rtnMsg = (rtnMsg || `[${RoleClass.WEREWOLF.emoji}${this.lang.getString("ROLE_ACTION_ROLE_NOT_EXISTS")}]`);

      //bot.showNotification(msg.id, rtnMsg);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
      return this.actionEvt;
    }
  }

  private getRolePlayers(role: RoleClassInterface, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole([role]));
    rtnMsg = _.map(target, (player: Player) => role.emoji + player.name).join(" ");

    return rtnMsg;
  }
}
