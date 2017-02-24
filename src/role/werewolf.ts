import * as _ from 'lodash';
import { Role } from './role';
import { Player } from "../player/player";
import { Promise } from 'es6-promise';

export class Werewolf extends Role {
  private resolve: any;
  private reject: any;

  constructor() {
    super({
      name: Role.WEREWOLF
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
    const key = [];

    key.push([{ text: "Wake Up", callback_data: "WAKE_UP" }]);
    key.push([{ text: "Left", callback_data: "CARD_A" }]);
    key.push([{ text: "Middle", callback_data: "CARD_B" }]);
    key.push([{ text: "Right", callback_data: "CARD_C" }]);

    bot.sendMessage(msg.chat.id, "`Werewolves`, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.", {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  callbackAbility(bot, msg, players) {
    // TODO: avoid syntax error for testing first
    console.log(`callbackAbility:`, msg);

    const target: Player = _.find(players, (player: Player) => player.getRole().name == Role.WEREWOLF);

    let rtnMsg: string = "";

    rtnMsg += `${target.name} : ${target.getRole().name}\n`;
    // _.map(target, (player: Player) => {
    // 	rtnMsg += player.name + " : " + player.role + "\n";
    // });

    bot.answerCallbackQuery(msg.id, rtnMsg);


    /*
     if (target.count > 1) {
     // 2 werewolf
     const rtnMsg:string;

     _.map(target, (player: Player) => {
     rtnMsg += player.name + " : " + player.role + "\n";
     });

     bot.answerCallbackQuery(msg.id, rtnMsg);
     }
     else if (target.count == 1) {
     // 1 werewolf
     }
     else {
     // no werewolf
     }

     let rtnMsg = '';

     _.map(target, (player: Player) => {
     rtnMsg += player.name + " : " + player.role + "\n";
     });
     */
    bot.answerCallbackQuery(msg.id, rtnMsg);
  }
}
