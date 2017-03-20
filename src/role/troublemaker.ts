import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Troublemaker extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super({
      emoji: Role.TROUBLEMAKER_EMOJI,
      name: Role.TROUBLEMAKER,
      ordering: 70
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
    const key = [];
    let pos = 0;
    let btnPerLine = 3;

    _.map(players, (player: Player) => {
      let row = pos / btnPerLine | 0;
      if (!key[row]) key[row] = [];
      key[row].push({ text: player.name, callback_data: "" + player.id });
      pos++;
    });

    bot.sendMessage(msg.chat.id, `${this.fullName}, wake up. Please select 2 player to swap their role. To cancel your selection, select the same again.`, {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.name} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });

    /*_.map(players, (playerFrom: Player) => {
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
      });*/
  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);
    let rtnMsg = '';
    let actionEvt: any;

    const regex = new RegExp(/^\d+_\d+/);

    console.log(`${this.name} useAbility:choice ${this.choice}`);
    if (regex.test(this.choice)) {
      //Already chose both player
      rtnMsg = "You already make your choice.";
    }
    else if (this.choice) {
      if (!/^\d+$/.test(msg.data))
        rtnMsg = "Invalid action";
      else {
        //Chose only 1 player
        if (host.id == parseInt(msg.data)) {
          rtnMsg = "Buddy, You cannot choose yourself.";
        }
        else if (this.choice == msg.data) {
          this.choice = "";
          rtnMsg = "You have cancelled, choose 2 players to swap.";
        }
        else {
          this.choice += "_" + msg.data;
          rtnMsg = this.swapPlayers(this.choice, players);
          actionEvt = this.actionLog("useAbility", host, this.choice, rtnMsg);
        }
      }
    }
    else {
      if (!/^\d+$/.test(msg.data))
        rtnMsg = "Invalid action";
      else {
        //Both not yet chose, now set the first player.
        if (host.id == parseInt(msg.data)) {
          rtnMsg = "Buddy, You cannot choose yourself.";
        }
        else {
          this.choice = msg.data;
          const target: Player = _.find(players, (player: Player) => player.id == msg.data);
          rtnMsg = `You have choose ${target.name}, choose 1 more player to swap.`;
        }
      }
    }
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return (actionEvt || this.actionLog("useAbility", host, this.choice, ""));
  }

  endTurn(bot, msg, players: Player[], table, host: Player) {
    console.log(`${this.name} endTurn`);
    let rtnMsg = '';
    let actionEvt: any;

    const regex = new RegExp(/^\d+_\d+/);

    console.log(`${this.name} endTurn:choice ${this.choice}`);
    if (regex.test(this.choice)) {
      //Already chose both player
      //do nothing
    }
    else if (this.choice) {
      //Random second player
      const targets = _.filter(players, p => p.id !== host.id); // not host
      const pos = _.random(0, targets.length - 1);
      this.choice += "_" + targets[pos].id;

      console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapPlayers(this.choice, players);
      actionEvt = this.actionLog("endTurn", host, this.choice, rtnMsg);
    }
    else {
      //Random first player
      let targets = _.filter(players, p => p.id !== host.id); // not host
      let pos = _.random(0, targets.length - 1);
      this.choice = "" + targets[pos].id;

      //Random second player
      targets = _.filter(players, p => (p.id !== host.id && p.id !== parseInt(this.choice))); // not host && first choice
      pos = _.random(0, targets.length - 1);
      this.choice += "_" + targets[pos].id;

      console.log(`${this.name} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapPlayers(this.choice, players);
      actionEvt = this.actionLog("endTurn", host, this.choice, rtnMsg);
    }
    bot.answerCallbackQuery(msg.id, rtnMsg);
    return (actionEvt || this.actionLog("endTurn", host, this.choice, ""));
    /*let rtnMsg = "";

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
    }*/
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

  actionLog(phase, host, choice, msg) {
    let actionMsg = "";
    if (msg) actionMsg = (phase == "useAbility" ? "" : `${Emoji.get('zzz')}  `) + msg;
    return super.footprint(host, choice, actionMsg)
  }
}
