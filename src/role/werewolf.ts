import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from './role';
import { Player } from "../player/player";

export class Werewolf extends Role implements RoleInterface {
  choice: string;

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
      [{ text: `Wake Up${Emoji.get('eyes')}`, callback_data: "WAKE_UP" }],
      [
        { text: `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`, callback_data: "CARD_A" },
        { text: `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_B" },
        { text: `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_C" }
      ]
    ];

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.`, {
    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} useAbility:`, msg);

    console.log(`${this.name} useAbility:choice ${this.choice}`);
    let rtnMsg: string = "";
    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF);

    if (msg.data == "WAKE_UP") {
      _.map(target, (player: Player) => {
        rtnMsg += player.name + ", ";
      });

      if (rtnMsg.length > 0)
        rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
    }
    else if ((msg.data == "CARD_A" || msg.data == "CARD_B" || msg.data == "CARD_C") && target.length == 1) {
      if (this.choice) {
        rtnMsg = "You already make your choice.";
      }
      else {
        this.choice = msg.data;
        rtnMsg = this.watchTable(this.choice, table);
      }
    }
    else {
      rtnMsg = "You cannot view the card.";
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";

    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().name == Role.WEREWOLF);

      if (target.length > 1) {
        _.map(target, (player: Player) => {
          rtnMsg += player.name + ", ";
        });

        if (rtnMsg.length > 0)
          rtnMsg = `${this.fullName} is: ` + rtnMsg.substr(0, rtnMsg.length - 2);
      }
      else if (target.length == 1) {
        this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
        console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
        rtnMsg = this.watchTable(this.choice, table);
      }
      else {
        // unreachable for no wolf
      }

      bot.answerCallbackQuery(msg.id, rtnMsg);
    }
  }

  private watchTable(picked: string, table) {
    let rtnMsg: string = "";

    rtnMsg = "Centre Card is :\n";

    if (picked == "CARD_A")
      rtnMsg += "[" + table.getLeft().fullName + "] [" + `${Emoji.get('question')}` + "] [" + `${Emoji.get('question')}` + "]";
    else if (picked == "CARD_B")
      rtnMsg += "[" + `${Emoji.get('question')}` + "] [" + table.getCenter().fullName + "] [?]";
    else if (picked == "CARD_C")
      rtnMsg += "[" + `${Emoji.get('question')}` + "] [" + `${Emoji.get('question')}` + "] [" + table.getRight().fullName + "]";
    else
      rtnMsg = "You cannot view the card in centre.";

    return rtnMsg;
  }
}
