import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from './role';
import { Player } from "../player/player";

export class Werewolf extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.WEREWOLF_EMOJI,
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
      [{ text: "Left", callback_data: "CARD_A" }, { text: "Middle", callback_data: "CARD_B" }, {
        text: "Right",
        callback_data: "CARD_C"
      }]
    ];

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.`, {
    bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log('sended', sended);
      });
  }

  useAbility(bot, msg, players, table) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} useAbility:`, msg);

    let rtnMsg: string = "";
    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF);

    if (msg.data == "WAKE_UP") {
      _.map(target, (player: Player) => {
        rtnMsg += player.name + ", ";
      });

      if (rtnMsg.length > 0)
        rtnMsg = `${this.emoji}  ${this.name} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
    }
    else if ((msg.data == "CARD_A" || msg.data == "CARD_B" || msg.data == "CARD_C") && target.length == 1) {
      rtnMsg = "Centre Card is :\n";

      if (msg.data == "CARD_A")
        rtnMsg += "[" + table.getLeft().emoji + table.getLeft().name + "] [" + `${Emoji.get('question')}` + "] [" + `${Emoji.get('question')}` + "]";
      else if (msg.data == "CARD_B")
        rtnMsg += "[" + `${Emoji.get('question')}` + "] [" + table.getCenter().emoji + table.getCenter().name + "] [?]";
      else if (msg.data == "CARD_C")
        rtnMsg += "[" + `${Emoji.get('question')}` + "] [" + `${Emoji.get('question')}` + "] [" + table.getRight().emoji + table.getRight().name + "]";
      else
        rtnMsg = "You cannot view the card in centre.";
    }
    else {
      rtnMsg = "You cannot view the card.";
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table) {

  }
}
