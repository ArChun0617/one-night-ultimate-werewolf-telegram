import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Troublemaker extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.TROUBLEMAKER_EMOJI,
      name: Role.TROUBLEMAKER
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
    const key = [];
    let col = 0;
    let row = 0;
    let playerStr = '';

    _.map(players, (playerFrom: Player) => {
      _.map(players, (playerTo: Player) => {
        col++;
        if (!key[row]) key[row] = [];
        if (playerFrom.id == playerTo.id) return true;
        key[row].push({
          text: `${(row + 1)}  ${Emoji.get('arrows_counterclockwise')}  ${(col)}`,
          callback_data: playerFrom.id + "_" + playerTo.id
        });
      });
      playerStr += `${(row + 1)}: ${playerFrom.name}\n`;
      col = 0;
      row++;
    });

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up.\n\n` + playerStr, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.name} useAbility:`, msg);
    let rtnMsg = '';

    if (this.choice) {
      rtnMsg = "You already make your choice.";
    }
    else {
      this.choice = msg.data;
      let chosenPlayer = this.choice.split('_');

      if (msg.from.id == parseInt(chosenPlayer[0]) || msg.from.id == parseInt(chosenPlayer[1]))
        rtnMsg = "Buddy, You cannot choose yourself.";
      else
        rtnMsg = this.swapPlayers(this.choice, players);
    }

    bot.answerCallbackQuery(msg.id, rtnMsg);
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = "";

    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      const key = [];
      _.map(players, (playerFrom: Player) => {
        if (playerFrom.id == parseInt(host.id)) return true;
        _.map(players, (playerTo: Player) => {
          if (playerTo.id == parseInt(host.id)) return true;
          if (playerFrom.id == playerTo.id) return true;
          key.push(playerFrom.id + "_" + playerTo.id);
        });
      });

      console.log(`${this.name} key:`, key);
      this.choice = _.shuffle(key)[0];
      console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapPlayers(this.choice, players);

      bot.answerCallbackQuery(msg.id, rtnMsg);
    }
  }

  private swapPlayers(picked: string, players) {
    let tableRole: Role;
    let rtnMsg = "";
    let chosenPlayer = picked.split('_');

    //if (!choice) choice = msg.data;	//To lock the Seer with only one choice
    const host: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[0]));
    const target: Player = _.find(players, (player: Player) => player.id == parseInt(chosenPlayer[1]));

    if (host && target) {
      // swap the role
      rtnMsg = host.name + `${Emoji.get('arrows_counterclockwise')}` + target.name;
      host.swapRole(target);
    }
    return rtnMsg;
  }
}
