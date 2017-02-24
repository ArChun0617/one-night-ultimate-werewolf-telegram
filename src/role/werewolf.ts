import * as _ from 'lodash';
import { Role } from './role';
import { Player } from "../player/player";

export class Werewolf extends Role {
  constructor() {
    super({
      name: Role.WEREWOLF
    });
  }

  wakeUp(bot, msg) {
    console.log(`${this.name} wake up called`);
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
    const key = [
		[{ text: "Wake Up", callback_data: "WAKE_UP" }],
		[{ text: "Left", callback_data: "CARD_A" }, { text: "Middle", callback_data: "CARD_B" }, { text: "Right", callback_data: "CARD_C" }]
	];
	
    bot.sendMessage(msg.chat.id, "`Werewolves`, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.", {
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
    const target: Player[] = _.filter(players, (player: Player) => player.getRole().name == Role.WEREWOLF);
	
	if (msg.data == "WAKE_UP" && target.length == 2) {
		rtnMsg = "Werewolf is :\n";

		//rtnMsg += `${target.name} : ${target.getRole().name}\n`;
		_.map(target, (player: Player) => {
			rtnMsg += player.name + " : " + player.role.name + "\n";
		});
	}
	else if ((msg.data == "CARD_A" || msg.data == "CARD_B" || msg.data == "CARD_C") && target.length == 1) {
		rtnMsg = "Centre Card is :\n";
		
		if (msg.data == "CARD_A") {
			rtnMsg += "[" + table.getLeft().name + "] [?] [?]";
		}
		else if (msg.data == "CARD_B") {
			rtnMsg += "[?] [" + table.getCenter().name + "] [?]";
		}
		else if (msg.data == "CARD_C") {
			rtnMsg += "[?] [?] [" + table.getRight().name + "]";
		}
		else {
			rtnMsg = "";
		}
	}
	
	bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
