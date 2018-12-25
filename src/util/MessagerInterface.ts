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

  showNotification(callbackQueryId, text, showAlert = this.newbieMode) {
    try {
      this.bot.answerCallbackQuery(callbackQueryId, {text: text, show_alert: showAlert});
    }
    catch (err) {
      console.log(`ERROR !!! [showNotification] : `, err.substring(0, 10)+"...");
    }
  }

  sendTokenMessage(text: string, msg, option = {}) {
    var msgKeyID = this.gameTokenID;

    if (msg.message && msg.message.message_id == msgKeyID) {
      // If from same message callback, update-insert
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
    else if (
        (!msg.message) ||                                     //If by command
        (msg.message && msg.message.message_id != msgKeyID)   // If from other message
    ){
      // If by command/other message, delete-insert
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
  }

  sendVoteMessage(text: string, msg, option = {}) {
    var msgKeyID = this.gameVoteID;

    if (msg.message && msg.message.message_id == msgKeyID) {
      // If from same message callback, update-insert
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
    else if (
        (!msg.message) ||                                     //If by command
        (msg.message && msg.message.message_id != msgKeyID)   // If from other message
    ){
      // If by command/other message, delete-insert
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
  }
}