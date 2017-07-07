import * as Emoji from 'node-emoji';
import * as _ from 'lodash';

export class Language {
  culture: string;

  zhHK: string[];
  en: string[];
  
  constructor(_culture: string = "zhHK") {
    this.culture = _culture || "en";

    //Initial English
    this.en = [];
    this.en["ROLE_COPYCAT"] = "Copycat";
    this.en["ROLE_DOPPELGANGER"] = "Doppelganger";
    this.en["ROLE_WEREWOLF"] = "Werewolf";
    this.en["ROLE_MINION"] = "Minion";
    this.en["ROLE_MASON"] = "Mason";
    this.en["ROLE_SEER"] = "Seer";
    this.en["ROLE_ROBBER"] = "Robber";
    this.en["ROLE_TROUBLEMAKER"] = "Troublemaker";
    this.en["ROLE_DRUNK"] = "Drunk";
    this.en["ROLE_INSOMNIAC"] = "Insomniac";
    this.en["ROLE_VILLAGER"] = "Villager";
    this.en["ROLE_TANNER"] = "Tanner";
    this.en["ROLE_HUNTER"] = "Hunter";

    this.en["SET_LANG"] = `${Emoji.get('robot_face')}  Select language`;
    this.en["LANG_SET"] = `${Emoji.get('robot_face')}  Language set !`;
    this.en["GAME_FOUND"] = `${Emoji.get('no_entry_sign')}  Sorry. There is a game start in this channel, please \/join the game`;
    this.en["NEW_GAME"] = `${Emoji.get('star')}  Created a new game, please \/join the game or \/start the game.`;
    this.en["GAME_TERMINATED"] = `${Emoji.get('bomb')}  Game terminated.`;
    this.en["GAME_ROLE_LIST"] = `The game has following roles:\n`;
    this.en["ASK_NEW_GAME"] = `${Emoji.get('bomb')}  Sorry. Please create a new game (/newgame)`;
    this.en["GAME_STARTED"] = `${Emoji.get('no_entry_sign')}  Sorry. The game has been started, please wait until next game`;
    this.en["ASK_SETTING"] = `${Emoji.get('no_entry_sign')}  Sorry. Please run /setting first`;
    this.en["GAME_START"] = `${Emoji.get('game_die')}  Game start`;
    this.en["TOO_MANY_PLAYER"] = `${Emoji.get('no_entry_sign')} Too many player joined already ! Please wait for next game!`;
    this.en["PLAYER_LIST"] = `Player joined, You can use \/start to start the game:\n`;
    this.en["WAIT_FOR_START"] = `${Emoji.get('microphone')} Wait for player to \/start... `;
    this.en["VOTE_BLANK"] = "Blank vote";
    this.en["VOTE_LIST"] = `${Emoji.get('arrow_right')}  Voting list ${Emoji.get('arrow_left')}`;
    this.en["GAME_CHECK_ROLE"] = `${Emoji.get('eyeglasses')}  Everyone, please check your role. The game has below role\n  `;
    this.en["GAME_VIEW_ROLE"] = `View your role${Emoji.get("black_joker")}`;
    this.en["NOTIFY_ROLE"] = `Your role is `;
    this.en["GAME_NIGHT_START"] = `${Emoji.get('crescent_moon')}  Night start, Everyone close your eye.`;
    this.en["GAME_DAY_START"] = `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, you can discuss for `;
    this.en["GAME_DAY_START_VOTE"] = `mins... \/vote at `;
    this.en["GAME_DAY_START_DOZED"] = `\nIf you dozed, try the button, It'll help.`;
    this.en["GAME_DAY_DOZED"] = `Oops... I dozed ${Emoji.get('zzz')}`;
    this.en["VOTE_START"] = `${Emoji.get('alarm_clock')}  Time\'s up. Everyone please vote.`;
    this.en["INVALID_ACTION"] = `${Emoji.get('middle_finger')}  Hey! Stop doing that!`;
    this.en["DAY_DOZED_FAKE"] = `${Emoji.get('middle_finger')}  You have woken up at night, LIAR !!`;
    this.en["VOTE_ERROR"] = `Invalid player selected !`;
    this.en["COUNT_DOWN"] = `${Emoji.get('microphone')} You still have `;
    this.en["ACTION_STACK"] = `Action Stack: `;

    this.en["ROLE_WAKE_UP"] = ", wake up.";
    this.en["ROLE_ALREADY_CHOOSE"] = "You already make your choice.";
    this.en["ROLE_INVALID_ACTION"] = "Invalid action";
    this.en["ROLE_ACTION_WAKE_UP"] = `Wake Up${Emoji.get('eyes')}`;
    this.en["ROLE_ACTION_VIEW_ERROR"] = "You cannot view the card.";
    this.en["ROLE_ACTION_ROLE_NOT_EXISTS"] = " not exists";

    this.en["ROLE_ACTION_WEREWOLF_VIEW_ERROR"] = "You cannot view the card in centre.";
    this.en["ROLE_WAKE_UP_TROUBLEMAKER"] = `, wake up. Please select 2 player to swap their role. To cancel your selection, select the same again.`;
    this.en["ROLE_ACTION_TROUBLEMAKER_ERROR"] = "Buddy, You cannot choose yourself.";
    this.en["ROLE_ACTION_TROUBLEMAKER_FIRST"] = `Choose 1 more player to swap with `;
    this.en["ROLE_ACTION_TROUBLEMAKER_CANCEL"] = "You have cancelled, choose 2 players to swap.";

    //Initial Chinese
    this.zhHK = [];
    this.zhHK["ROLE_COPYCAT"] = "模仿者";
    this.zhHK["ROLE_DOPPELGANGER"] = "化身幽靈";
    this.zhHK["ROLE_WEREWOLF"] = "狼人";
    this.zhHK["ROLE_MINION"] = "爪牙";
    this.zhHK["ROLE_MASON"] = "守夜人";
    this.zhHK["ROLE_SEER"] = "預言家";
    this.zhHK["ROLE_ROBBER"] = "強盜";
    this.zhHK["ROLE_TROUBLEMAKER"] = "搗蛋鬼";
    this.zhHK["ROLE_DRUNK"] = "酒鬼";
    this.zhHK["ROLE_INSOMNIAC"] = "失眠者";
    this.zhHK["ROLE_VILLAGER"] = "村民";
    this.zhHK["ROLE_TANNER"] = "皮匠";
    this.zhHK["ROLE_HUNTER"] = "獵人";

    this.zhHK["SET_LANG"] = `${Emoji.get('robot_face')}  選擇語言`;
    this.zhHK["LANG_SET"] = `${Emoji.get('robot_face')}  語言設定完成`;
    this.zhHK["GAME_FOUND"] = `${Emoji.get('no_entry_sign')}  有人開咗局喇, 你可以用 \/join 加入遊戲`;
    this.zhHK["NEW_GAME"] = `${Emoji.get('star')} 開咗局新遊戲, 其他人可以用 \/join 加入遊戲`;
    this.zhHK["GAME_TERMINATED"] = `${Emoji.get('bomb')}  遊戲中止`;
    this.zhHK["GAME_ROLE_LIST"] = `呢局遊戲有以下既角色:\n`;
    this.zhHK["ASK_NEW_GAME"] = `${Emoji.get('bomb')}  未有人開局喎, 你可以用 \/newgame 黎開一局新既`;
    this.zhHK["GAME_STARTED"] = `${Emoji.get('no_entry_sign')} 開咗波喇, 等下一局啦`;
    this.zhHK["ASK_SETTING"] = `${Emoji.get('no_entry_sign')}  請先設定遊戲 \/setting`;
    this.zhHK["GAME_START"] = `${Emoji.get('game_die')}  遊戲開始`;
    this.zhHK["TOO_MANY_PLAYER"] = `${Emoji.get('no_entry_sign')} 太多人喇! 等下一局啦`;
    this.zhHK["PLAYER_LIST"] = `以下玩家己加入, 用 \/start 嚟開始遊戲:\n`;
    this.zhHK["WAIT_FOR_START"] = `${Emoji.get('microphone')} 等全部人準備好 \/start ... `;
    this.zhHK["VOTE_BLANK"] = "白票";
    this.zhHK["VOTE_LIST"] = `${Emoji.get('arrow_right')} 投票 ${Emoji.get('arrow_left')}`;
    this.zhHK["GAME_CHECK_ROLE"] = `${Emoji.get('eyeglasses')} 大家可以開牌睇自己既身份, 呢局遊戲有以下既角色\n  `;
    this.zhHK["GAME_VIEW_ROLE"] = `開牌${Emoji.get("black_joker")}`;
    this.zhHK["NOTIFY_ROLE"] = `你既身份係 `;
    this.zhHK["GAME_NIGHT_START"] = `${Emoji.get('crescent_moon')} 夜深喇, 夠鐘瞓覺喇, 大家合埋眼`;
    this.zhHK["GAME_DAY_START"] = `${Emoji.get('hourglass_flowing_sand')}  天光喇 起身喇, 你地可以傾 `;
    this.zhHK["GAME_DAY_START_VOTE"] = `分鐘... \/vote 投票時間係 `;
    this.zhHK["GAME_DAY_START_DOZED"] = `\n如果你真係瞓咗, 你按吓個制啦, 佢會幫倒你`;
    this.zhHK["GAME_DAY_DOZED"] = `哎呀... 瞓咗添 ${Emoji.get('zzz')}`;
    this.zhHK["VOTE_START"] = `${Emoji.get('alarm_clock')} 夠鐘喇, 大家要投票喇`;
    this.zhHK["INVALID_ACTION"] = `${Emoji.get('middle_finger')} 喂! 唔好亂禁好喎!`;
    this.zhHK["DAY_DOZED_FAKE"] = `${Emoji.get('middle_finger')} 你都冇瞓到, 不愧為省港澳大話王 !!`;
    this.zhHK["VOTE_ERROR"] = `你唔可以投呢個人喎 !`;
    this.zhHK["COUNT_DOWN"] = `${Emoji.get('microphone')} 你仲有 `;
    this.zhHK["ACTION_STACK"] = `行動順序: `;

    this.zhHK["ROLE_WAKE_UP"] = ", 起身喇 !";
    this.zhHK["ROLE_ALREADY_CHOOSE"] = "你揀左喇喎";
    this.zhHK["ROLE_INVALID_ACTION"] = "行動錯誤";
    this.zhHK["ROLE_ACTION_WAKE_UP"] = `起身${Emoji.get('eyes')}`;
    this.zhHK["ROLE_ACTION_VIEW_ERROR"] = "你唔可以睇呢張牌喎";
    this.zhHK["ROLE_ACTION_ROLE_NOT_EXISTS"] = " 唔喺度";
    
    this.zhHK["ROLE_ACTION_WEREWOLF_VIEW_ERROR"] = "你唔可以睇中間既牌喎";
    this.zhHK["ROLE_WAKE_UP_TROUBLEMAKER"] = `, 起身喇 ! 你可以揀兩個玩家既牌黎對調, 揀多一次同一個人嚟取消`;
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_ERROR"] = "老友, 你唔可以掉你自己架喎";
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_FIRST"] = `揀多一個人黎換 `;
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_CANCEL"] = "你取消咗喇, 重新揀兩個人嚟對調啦";
  }

  public setLang = (lang: string) => {
    this.culture = lang;
  }

  public getString = (key: string): string => {
    let value: string = "";
    let culArr: string[];

    switch (this.culture) {
      case "en":
        culArr = this.en;
        break;
      case "zhHK":
        culArr = this.zhHK;
        break;
      default:
        culArr = this.en;
        break;
    }
    return culArr[key];
  }
}