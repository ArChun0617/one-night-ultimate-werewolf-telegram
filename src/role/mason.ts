import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Mason extends Role {
  constructor() {
    super({
      emoji: Role.MASON_EMOJI,
      name: Role.MASON
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // notify werewolf buddies
    const key = [];

    key.push([{ text: "Wake Up", callback_data: "WAKE_UP" }]);
	
    //bot.sendMessage(msg.chat.id, `${this.emoji}${this.name}, wake up. '${wolf.emoji}${wolf.name}', stick out your thumb so the Minion can see who you are.`, {
	bot.sendMessage(msg.chat.id, `${this.emoji}${this.name}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players) {
    console.log(`${this.name} callbackAbility:`, msg);
	
	const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.MASON);
	let rtnMsg: string = "";
	
	if (msg.data == "WAKE_UP") {
		_.map(target, (player: Player) => {
			rtnMsg += player.name + ", ";
		});
		
		if (rtnMsg.length > 0)
			rtnMsg = `${this.emoji}${this.name} is: ` + rtnMsg.substr(0, rtnMsg.length -2);
	}
	
	bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
