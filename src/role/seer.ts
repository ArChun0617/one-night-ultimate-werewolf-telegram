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
    // sendMessage [AB] [BC] [AC] [Player1] [Player2] ...
    // lock the option when callback_query
    const key = [];

    _.map(players, (player: Player) => {
      key.push(
        [{ text: player.name, callback_data: player.id }]
      );
    });

    key.push([{ text: "Center Left & Middle", callback_data: "CARD_AB" }]);
    key.push([{ text: "Center Left & Right", callback_data: "CARD_AC" }]);
    key.push([{ text: "Center Middle & Right", callback_data: "CARD_BC" }]);

    bot.sendMessage(msg.chat.id, "`Seer`, wake up. You may look at another player's card or two of the center cards.", {
		reply_markup: JSON.stringify({inline_keyboard: key})
	})
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players) {
    // const caller = _.find(users, user => user.id === msg.from.id);
    //
    // //Check if the caller is a Seer
    // if (caller.role != Role.SEER) {
    //   bot.answerCallbackQuery(msg.id, "${Emoji.get('clap')} you asshole !");
    //   return;
    // }

    // TODO: avoid syntax error for testing first
    let choice = 'xxx';
    let rtnMsg = '';
    const table = [];

    if (!choice) choice = msg.data;	//To lock the Seer with only one choice	

    const target: Player = _.find(players, (player: Player) => player.id == parseInt(choice));

    if (target) {
      // if target to a specific guy
      rtnMsg = target.name + " : " + target.getRole().name;
    }
    else {
      switch (choice) {
        case 'CARD_AB':
          rtnMsg = table[0].name + " : " + table[0].currentRole + "\n" + table[1].name + " : " + table[1].currentRole;
        case 'CARD_AC':
          rtnMsg = table[0].name + " : " + table[0].currentRole + "\n" + table[2].name + " : " + table[2].currentRole;
        case 'CARD_BC':
          rtnMsg = table[1].name + " : " + table[1].currentRole + "\n" + table[2].name + " : " + table[2].currentRole;
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
