import * as _ from 'lodash';

export class MessagerInterface {
  bot: any;
  private gameChatID: number;
  private gameActionID: number;

  get chatID(): number {
    return this.gameChatID;
  }
  set chatID(value) {
    this.gameChatID = value;
  }
  get actionID(): number {
    return this.gameActionID;
  }
  set actionID(value) {
    this.gameActionID = value;
  }
  
  constructor(_bot: any) {
    /*let ansCallback = _bot.answerCallbackQuery;

    _bot.answerCallbackQuery = ((callbackQueryId, text, showAlert, form = {}) => {
      try {
        ansCallback(callbackQueryId, text, showAlert, form = {});
      }
      catch (err) {
        console.log("errorrr!! ", err);
      }
    });*/

    this.bot = _bot;
    this.gameChatID = -1;
    this.gameActionID = -1;
  }

  sendMsg(text, option = {}) {
    try {
      return this.bot.sendMessage(this.gameChatID, text, option);
    }
    catch (err) {
      console.log(`ERROR !!! [sendMsg] : `, err.substring(0, 10) + "...");
    }
  }

  editAction(text, options = {}) {
    try {
      return this.bot.editMessageText(text, _.extend(options, {
        chat_id: this.gameChatID,
        message_id: (options["gameActionID"] || this.gameActionID)
      }));
    }
    catch (err) {
      console.log(`ERROR !!! [editAction] : `, err.substring(0, 10) + "...");
    }
  }

  showNotification(callbackQueryId, text, showAlert = true, form = {}) {
    try {
      this.bot.answerCallbackQuery(callbackQueryId, text, showAlert, form);
    }
    catch (err) {
      console.log(`ERROR !!! [showNotification] : `, err.substring(0, 10)+"...");
    }
  }
}