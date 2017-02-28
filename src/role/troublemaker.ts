import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Troublemaker extends Role {
  choice: string;

  constructor() {
    super({
      emoji: Role.TROUBLEMAKER_EMOJI,
      name: Role.TROUBLEMAKER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
    const key = [];
    let col = 0;
    let row = 0;
    let playerStr = "";

    _.map(players, (playerFrom: Player) => {
      _.map(players, (playerTo: Player) => {
        if (!key[row]) key[row] = [];
        if (playerFrom.id == playerTo.id) return true;
        key[row].push({ text: (row + 1) + `${Emoji.get('arrows_counterclockwise')}` + (col + 1), callback_data: playerFrom.id + "_" + playerTo.id });
        col++;
      });
      playerStr += (row + 1) + " : " + playerFrom.name + "\n";
      col = 0;
      row++;
    });

    bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up.\n\n` + playerStr, {
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
      let chosenPlayer = this.choice.split('_');
      let rtnMsg = '';

      if (msg.from.id == parseInt(chosenPlayer[0]) || msg.from.id == parseInt(chosenPlayer[1])) {
        rtnMsg = "Buddy, You cannot choose yourself.";
      }
      else {
        //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
        const host: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[0]));
        const target: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[1]));

        if (host && target) {
          // swap the role
          rtnMsg = host.name + `${Emoji.get('arrows_counterclockwise')}` + target.name;
          host.swapRole(target);
        }
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
