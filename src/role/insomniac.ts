import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Insomniac extends Role {
  constructor() {
    super({
      emoji: Role.INSOMNIAC_EMOJI,
      name: Role.INSOMNIAC
    });
  }
  
  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // sendMessage [view] click to know the final role
    const key = [
		[{ text: "Wake Up", callback_data: "WAKE_UP" }]
	];
	
    bot.sendMessage(msg.chat.id, `${this.emoji}${this.name}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players, table) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} callbackAbility:`, msg);
	
	let rtnMsg: string = "";
    const target: Player = _.find(players, (player: Player) => player.id == msg.from.id);
	
	if (msg.data == "WAKE_UP")
		rtnMsg = target.name + " is: " + target.getRole().emoji + target.getRole().name;
	
	bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
