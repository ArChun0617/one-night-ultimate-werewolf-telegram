import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Robber extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.ROBBER_EMOJI,
      name: Role.ROBBER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1] [Player2] [DO NOTHING] ...
    // lock the option when callback_query to notify the new role
    const key = [];
    let pos = 0;
    let btnPerLine = 3;

    _.map(players, (player: Player) => {
      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  useAbility(bot, msg, players, table) {
    console.log(`${this.name} useAbility:`, msg);
    let rtnMsg = '';

    if (this.choice) {
      rtnMsg = "You already make your choice.";
    }
    else {
      this.choice = msg.data;

      //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
      const host: Player = _.find(players, (player: Player) => player.id == parseInt(msg.from.id));
      rtnMsg = this.swapPlayer(this.choice, host, players);
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";

    if (!this.choice) {
      const key = [];
      _.map(players, (player: Player) => {
        if (player.id !== host.id)
          key.push({ text: player.name, callback_data: "" + player.id });
      });

      this.choice = _.shuffle(key)[0];
      rtnMsg = this.swapPlayer(this.choice, host, players);

      bot.answerCallbackQuery(msg.id, rtnMsg);
    }
  }

  private swapPlayer(picked: string, host, players) {
    let tableRole: Role;
    let rtnMsg = "";
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(this.choice));

    if (host && target) {
      // swap the role
      rtnMsg = target.name + " : " + target.getRole().fullName;
      host.swapRole(target);
    }
    return rtnMsg;
  }
}
