import * as _ from 'lodash';

export class MessagerInterface {
  bot: any;
  private gameChatID: number;
  private gameActionID: number;
  private gameTokenID: number;
  private gameVoteID: number;
  private newbieMode: boolean;

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
  
  constructor(_bot: any, _newbieMode: boolean) {
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
    this.newbieMode = _newbieMode;
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

  showNotification(callbackQueryId, text, showAlert = this.newbieMode, form = {}) {
    try {
      this.bot.answerCallbackQuery(callbackQueryId, text, showAlert, form);
    }
    catch (err) {
      console.log(`ERROR !!! [showNotification] : `, err.substring(0, 10)+"...");
    }
  }

  sendTokenMessage(text: string, isCommand: boolean, option = {}) {
    var msgKeyID = this.gameTokenID;

    if (isCommand) {
      //console.log(`sendTokenMessage.isCommand = true`, msgKeyID);
      // If by command, delete-insert
      if (msgKeyID) {
        try {
            this.bot.deleteMessage(this.gameChatID, msgKeyID);
        }catch (e) {
            // Unknown error for unsupported deleteMessage
        }
      }

      this.bot
        .sendMessage(this.gameChatID, text, option)
        .then((sended) => {
          this.gameTokenID = sended.message_id;
        });
    }
    else {
      //console.log(`sendTokenMessage.isCommand = false`);
      // If by callback, update-insert
      if (msgKeyID) {
        this.bot.editMessageText(text, _.extend(option, {
          chat_id: this.gameChatID,
          message_id: msgKeyID
        }));
      }
      else {
        // Abnormal case as callback without original message, but send message anyway
        this.bot
          .sendMessage(this.gameChatID, text, option)
          .then((sended) => {
            this.gameTokenID = sended.message_id;
          });
      }
    }
  }

  sendVoteMessage(text: string, isCommand: boolean, option = {}) {
    var msgKeyID = this.gameVoteID;
    if (isCommand) {
      // If by command, delete-insert
      if (msgKeyID) {
        try {
            this.bot.deleteMessage(this.gameChatID, msgKeyID);
        }catch (e) {
            // Unknown error for unsupported deleteMessage
        }
      }

      this.bot
        .sendMessage(this.gameChatID, text, option)
        .then((sended) => {
          this.gameVoteID = sended.message_id;
        });
    }
    else {
      // If by callback, update-insert
      if (msgKeyID) {
        this.bot.editMessageText(text, _.extend(option, {
          chat_id: this.gameChatID,
          message_id: msgKeyID
        }));
      }
      else {
        // Abnormal case as callback without original message, but send message anyway
        this.bot
          .sendMessage(this.gameChatID, text, option)
          .then((sended) => {
            this.gameVoteID = sended.message_id;
          });
      }
    }
  }
}