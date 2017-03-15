import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Seer extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.SEER_EMOJI,
      name: Role.SEER,
      ordering: 50
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // sendMessage [AB] [BC] [AC] [Player1] [Player2] ...
    // lock the option when callback_query
    const key = [];
    let pos = 0;
    let btnPerLine = 3;

    _.map(players, (player: Player) => {
      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    key.push([
      { text: `${this.emoji}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_AB" },
      { text: `${this.emoji}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_AC" },
      { text: `${Emoji.get('question')}${this.emoji}${this.emoji}`, callback_data: "CARD_BC" }
    ]);

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up. You may look at another player's card or two of the center cards.`, {
    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);
    let rtnMsg = '';

    if (this.choice) {
      rtnMsg = "You already make your choice.";
    }
    else {
      if (!/^\d+$/.test(msg.data) && !_.includes(["CARD_AB", "CARD_AC", "CARD_BC"], msg.data))
        rtnMsg = "Invalid action";
      else {
        // TODO: avoid syntax error for testing first
        this.choice = msg.data;
        rtnMsg = this.watchRole(this.choice, players, table);
      }
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
    return this.actionLog("useAbility", host, this.choice, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";

    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      const key = ["CARD_AB", "CARD_AC", "CARD_BC"];

      _.map(players, (player: Player) => {
        if (player.id !== host.id)
          key.push(player.id+"");
      });

      this.choice = _.shuffle(key)[0];
      console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.watchRole(this.choice, players, table);

      bot.answerCallbackQuery(msg.id, rtnMsg);
      return this.actionLog("endTurn", host, this.choice, rtnMsg);
    }
  }

  private watchRole(picked: string, players, table) {
    let rtnMsg = "";

    const target: Player = _.find(players, (player: Player) => player.id == parseInt(picked));

    if (target) {
      // if target to a specific guy
      rtnMsg = `${target.getRole().emoji}${target.name}`;
    }
    else {
      switch (picked) {
        case 'CARD_AB':
          rtnMsg = `${table.getLeft().fullName}${table.getCenter().fullName}${Emoji.get('question')}`;
          break;
        case 'CARD_AC':
          rtnMsg = `${table.getLeft().fullName}${Emoji.get('question')}${table.getRight().fullName}`;
          break;
        case 'CARD_BC':
          rtnMsg = `${Emoji.get('question')}${table.getCenter().fullName}${table.getRight().fullName}`;
          break;
        default:
          break;
      }
    }

    return rtnMsg;
  }

  actionLog(phase, host, choice, msg) {
    let actionMsg = "";
    actionMsg = (phase == "useAbility" ? "" : `${Emoji.get('zzz')}  `) + msg;
    return super.footprint(host, choice, actionMsg)
  }
}
