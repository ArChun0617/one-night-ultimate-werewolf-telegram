import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Seer extends Role {
  constructor() {
    super({
      name: Role.SEER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [AB] [BC] [AC] [Player1] [Player2] ...
    // lock the option when callback_query
    const key = [];
	let pos = 0;
	let btnPerLine = 3;
	
    _.map(players, (player: Player) => {
		let row = pos/btnPerLine|0;
	  if (!key[row]) key[row] = [];
	  key[row].push({ text: player.name, callback_data: ""+player.id });
	  pos++;
    });

    key.push([{ text: "Left & Middle", callback_data: "CARD_AB" }, { text: "Left & Right", callback_data: "CARD_AC" }, { text: "Middle & Right", callback_data: "CARD_BC" }]);

	console.log(JSON.stringify(key));
	
    bot.sendMessage(msg.chat.id, "`Seer`, wake up. You may look at another player's card or two of the center cards.", {
		reply_markup: JSON.stringify({inline_keyboard: key})
	})
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players, table) {
    console.log(`${this.name} callbackAbility:`, msg);
    // const caller = _.find(users, user => user.id === msg.from.id);
    //
    // //Check if the caller is a Seer
    // if (caller.role != Role.SEER) {
    //   bot.answerCallbackQuery(msg.id, "${Emoji.get('clap')} you asshole !");
    //   return;
    // }

    // TODO: avoid syntax error for testing first
    let choice = msg.data;
    let rtnMsg = '';

    //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(choice));
	
    if (target) {
      // if target to a specific guy
      rtnMsg = target.name + " : " + target.getRole().name;
    }
    else {
      switch (choice) {
        case 'CARD_AB':
          rtnMsg = "[" + table.getLeft().name + "] [" + table.getCenter().name + "] [?]";
		  break;
        case 'CARD_AC':
          rtnMsg = "[" + table.getLeft().name + "] [?] [" + table.getRight().name + "]";
		  break;
        case 'CARD_BC':
          rtnMsg = "[?] [" + table.getCenter().name + "] [" + table.getRight().name + "] [?]";
		  break;
		default:
		  break;
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
