var TelegramBot = require('node-telegram-bot-api');
var token = '331592410:AAHy9uA7PLWBHmIcNcyNt78hT6XLarrOjHM';
//括號裡面的內容需要改為在第5步獲得的Token
var bot = new TelegramBot(token, {polling: true});
//使用Long Polling的方式與Telegram伺服器建立連線
 
//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id; //用戶的ID
    var resp = '你好'; //括號裡面的為回應內容，可以隨意更改
	
	console.log(chatId);
	
    bot.sendMessage(chatId, resp); //發送訊息的function
});
 
//收到/cal開頭的訊息時會觸發這段程式
bot.onText(/\/cal (.+)/, function (msg, match) {
    var fromId = msg.from.id; //用戶的ID
    var resp = match[1].replace(/[^-()\d/*+.]/g, '');
	
	console.log(fromId + ":" + resp);
	
    // match[1]的意思是 /cal 後面的所有內容
    resp = '計算結果為: ' + eval(resp);
    // eval是用作執行計算的function
    bot.sendMessage(fromId, resp); //發送訊息的function
});
 
bot.onText(/(.+)/, function (msg, match) {
    var fromId = msg.from.id; //用戶的ID	
	console.log(fromId + ":" + match[1]);
    bot.sendMessage(fromId, match[1]); //發送訊息的function
});