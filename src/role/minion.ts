import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Minion extends Role {
  constructor() {
    super({
      name: Role.MINION
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // notify werewolf buddies
    const key = [];

    key.push([{ text: "Wake Up", callback_data: "WAKE_UP" }]);

    bot.sendMessage(msg.chat.id, "`Minion`, wake up. `Werewolves`, stick out your thumb so the Minion can see who you are.", {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players) {
    console.log(`${this.name} callbackAbility:`, msg);
	
	const target: Player[] = _.filter(players, (player: Player) => player.getRole().name == Role.WEREWOLF);

	let rtnMsg: string = "Werewolf is :\n";

	//rtnMsg += `${target.name} : ${target.getRole().name}\n`;
	_.map(target, (player: Player) => {
		rtnMsg += player.name + " : " + player.role.name + "\n";
	});

	bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
