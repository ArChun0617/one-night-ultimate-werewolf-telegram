import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Seer extends Role {
  constructor() {
    super({
      emoji: Role.SEER_EMOJI,
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
      if (player.id == msg.from.id) return true;	// skip seer himself

      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    key.push([{ text: "Left & Middle", callback_data: "CARD_AB" }, {
      text: "Left & Right",
      callback_data: "CARD_AC"
    }, { text: "Middle & Right", callback_data: "CARD_BC" }]);

    //bot.sendMessage(msg.chat.id, `${this.emoji}${this.name}, wake up. You may look at another player's card or two of the center cards.`, {
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

    // TODO: avoid syntax error for testing first
    let choice = msg.data;
    let rtnMsg = '';

    //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(choice));

    if (target) {
      // if target to a specific guy
      rtnMsg = target.name + " : " + target.getRole().emoji + target.getRole().name;
    }
    else {
      switch (choice) {
        case 'CARD_AB':
          rtnMsg = "[" + table.getLeft().emoji + table.getLeft().name + "] [" + table.getCenter().emoji + table.getCenter().name + "] [" + `${Emoji.get('question')}` + "]";
          break;
        case 'CARD_AC':
          rtnMsg = "[" + table.getLeft().emoji + table.getLeft().name + "] [" + `${Emoji.get('question')}` + "] [" + table.getRight().emoji + table.getRight().name + "]";
          break;
        case 'CARD_BC':
          rtnMsg = "[" + `${Emoji.get('question')}` + "] [" + table.getCenter().emoji + table.getCenter().name + "] [" + table.getRight().emoji + table.getRight().name + "]";
          break;
        default:
          break;
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
