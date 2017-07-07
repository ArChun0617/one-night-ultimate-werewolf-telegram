import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface, RoleClass } from "./role";
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Troublemaker extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super(RoleClass.TROUBLEMAKER);
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.code} wake up called`);
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

    bot.editAction(this.fullName + this.lang.getString("ROLE_WAKE_UP_TROUBLEMAKER"), {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.code} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
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
        console.log(`${this.code} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });*/
  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.code} useAbility.msg.data: ${msg.data}`);
    let rtnActionEvt: ActionFootprint;
    let rtnMsg = '';

    const regex = new RegExp(/^\d+_\d+/);

    console.log(`${this.code} useAbility:choice ${this.choice}`);
    if (regex.test(this.choice)) {
      //Already chose both player
      rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
    }
    else if (this.choice) {
      if (!/^\d+$/.test(msg.data))
        rtnMsg = this.lang.getString("ROLE_INVALID_ACTION");
      else {
        //Chose only 1 player
        if (host.id == parseInt(msg.data)) {
          rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_ERROR");
        }
        else if (this.choice == msg.data) {
          this.choice = "";
          rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_CANCEL");
        }
        else {
          this.choice += "_" + msg.data;
          rtnMsg = this.swapPlayers(this.choice, players);
          rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
        }
      }
    }
    else {
      if (!/^\d+$/.test(msg.data))
        rtnMsg = this.lang.getString("ROLE_INVALID_ACTION");
      else {
        //Both not yet chose, now set the first player.
        if (host.id == parseInt(msg.data)) {
          rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_ERROR");
        }
        else {
          this.choice = msg.data;
          const target: Player = _.find(players, (player: Player) => player.id == msg.data);
          rtnMsg = this.lang.getString("ROLE_ACTION_TROUBLEMAKER_FIRST") + target.name;
        }
      }
    }
    bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players: Player[], table, host: Player) {
    console.log(`${this.code} endTurn`);
    let rtnMsg = '';
    let actionEvt: any;

    const regex = new RegExp(/^\d+_\d+/);

    console.log(`${this.code} endTurn:choice ${this.choice}`);
    if (regex.test(this.choice)) {
      //Already chose both player
      //do nothing
    }
    else if (this.choice) {
      //Random second player
      const targets = _.filter(players, p => (p.id !== host.id && p.id !== parseInt(this.choice))); // not host && first choice
      const pos = _.random(0, targets.length - 1);
      this.choice += "_" + targets[pos].id;

      console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapPlayers(this.choice, players);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
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

      console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
      rtnMsg = this.swapPlayers(this.choice, players);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
    }
    //bot.showNotification(msg.id, rtnMsg);
    return (rtnMsg ? this.actionEvt : null);
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
