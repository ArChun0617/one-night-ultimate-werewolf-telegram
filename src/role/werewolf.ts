import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Role, RoleInterface, RoleClass, RoleClassInterface } from './role';
import { Player } from "../player/player";
import { ActionFootprint } from "../util/ActionFootprint";

export class Werewolf extends Role implements RoleInterface {
  choice: string;

  constructor() {
    super(RoleClass.WEREWOLF);
  }

  wakeUp(bot, msg) {
    console.log(`${this.code} wake up called`);
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
    const key = [
      [{ text: this.lang.getString("ROLE_ACTION_WAKE_UP"), callback_data: "WAKE_UP" }],
      [
        { text: `${this.emoji}${Emoji.get('question')}${Emoji.get('question')}`, callback_data: "CARD_A" },
        { text: `${Emoji.get('question')}${this.emoji}${Emoji.get('question')}`, callback_data: "CARD_B" },
        { text: `${Emoji.get('question')}${Emoji.get('question')}${this.emoji}`, callback_data: "CARD_C" }
      ]
    ];

    //bot.sendMessage(msg.chat.id, `${this.emoji}  ${this.name}, wake up and look for other werewolves. If there is only one Werewolf, you may look at a card from the center.`, {
    bot.editAction(this.fullName + this.lang.getString("ROLE_WAKE_UP"), {
      reply_markup: JSON.stringify({ inline_keyboard: key })
    })
      .then((sended) => {
        // `sended` is the sent message.
        console.log(`${this.code} sended >> MessageID:${sended.message_id} Text:${sended.text}`);
      });
  }

  useAbility(bot, msg, players, table, host) {
    let rtnActionEvt: ActionFootprint;

    // TODO: avoid syntax error for testing first
    console.log(`${this.code} useAbility.msg.data: ${msg.data}`);

    console.log(`${this.code} useAbility:choice ${this.choice}`);
    let rtnMsg: string = "";
    const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().checkRole([RoleClass.WEREWOLF]));

    if (msg.data == "WAKE_UP") {
      rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
      if (target.length >= 2) this.choice = rtnMsg;
      rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
    }
    else if ((msg.data == "CARD_A" || msg.data == "CARD_B" || msg.data == "CARD_C") && target.length == 1) {
      if (this.choice) {
        rtnMsg = this.lang.getString("ROLE_ALREADY_CHOOSE");
      }
      else {
        this.choice = msg.data;
        rtnMsg = this.watchTable(this.choice, table);
        rtnActionEvt = this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg);
      }
    }
    else {
      rtnMsg = this.lang.getString("ROLE_ACTION_VIEW_ERROR");
    }

    bot.showNotification(msg.id, rtnMsg);
    return rtnActionEvt;
  }

  endTurn(bot, msg, players, table, host) {
    // TODO: avoid syntax error for testing first
    console.log(`${this.code} endTurn`);
    let rtnMsg = "";

    console.log(`${this.code} endTurn:choice ${this.choice}`);
    if (!this.choice) {
      const target: Player[] = _.filter(players, (player: Player) => player.getOriginalRole().checkRole([RoleClass.WEREWOLF]));

      if (target.length >= 2) {
        rtnMsg = this.getRolePlayers(RoleClass.WEREWOLF, players);
        this.choice = rtnMsg;
      }
      else if (target.length == 1) {
        this.choice = _.shuffle(["CARD_A", "CARD_B", "CARD_C"])[0];
        console.log(`${this.code} endTurn:choice_Shuffle ${this.choice}`);
        rtnMsg = this.watchTable(this.choice, table);
      }
      else {
        // unreachable for no wolf
      }

      //bot.showNotification(msg.id, rtnMsg);
      this.actionEvt = new ActionFootprint(host, this.choice, rtnMsg, true);
      return this.actionEvt;
    }
  }

  private getRolePlayers(role: RoleClassInterface, players) {
    let target: Player[];
    let rtnMsg: string;
    target = _.filter(players, (player: Player) => player.getOriginalRole().checkRole([role]));
    rtnMsg = _.map(target, (player: Player) => role.emoji + player.name).join(" ");

    return rtnMsg;
  }

  private watchTable(picked: string, table) {
    let rtnMsg: string = "";

    switch (picked) {
      case "CARD_A":
        rtnMsg += `${table.getLeft().fullName}${Emoji.get('question')}${Emoji.get('question')}`;
        break;
      case "CARD_B":
        rtnMsg += `${Emoji.get('question')}${table.getCenter().fullName}${Emoji.get('question')}`;
        break;
      case "CARD_C":
        rtnMsg += `${Emoji.get('question')}${Emoji.get('question')}${table.getRight().fullName}`;
        break;
      default:
        rtnMsg += this.lang.getString("ROLE_ACTION_WEREWOLF_VIEW_ERROR");
        break;
    }

    return rtnMsg;
  }
}
