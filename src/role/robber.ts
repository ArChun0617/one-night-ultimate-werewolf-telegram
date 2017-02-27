import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Robber extends Role {
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
      if (player.id == msg.from.id) return true;	// skip robber himself

      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    bot.sendMessage(msg.chat.id, `${this.emoji}${this.name}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  useAbility(bot, msg, players, table) {
    console.log(`${this.name} useAbility:`, msg);

    let choice = msg.data;
    let rtnMsg = '';

    //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
    const host: Player = _.find(players, (player: Player) => player.id == parseInt(msg.from.id));
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(choice));

    if (host && target) {
      // swap the role
      rtnMsg = target.name + " : " + target.getRole().emoji + target.getRole().name;
      host.swapRole(target);
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
