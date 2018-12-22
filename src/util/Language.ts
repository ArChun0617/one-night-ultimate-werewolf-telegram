import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { RoleClass } from "../role/role";

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

    this.en["ROLE_WAKE_UP_COPYCAT"] = "你可以揀中間一張身份然後複製果個身份, 到果個身份行動嘅時候, 你需要起身做佢嘅行動";
    this.en["ROLE_WAKE_UP_DOPPELGANGER"] =  `Choose a player to copy his role.\n If you are ${RoleClass.SEER.emoji}${RoleClass.ROBBER.emoji}${RoleClass.TROUBLEMAKER.emoji}${RoleClass.DRUNK.emoji}, do your action now.\nIf you are ${RoleClass.WEREWOLF.emoji}${RoleClass.MINION.emoji}${RoleClass.MASON.emoji}${RoleClass.INSOMNIAC.emoji}, wait until their turn.`;
    this.en["ROLE_WAKE_UP_WEREWOLF"] = "你可以確認場上嘅狼人, 如果只有你一位狼人, 你可以揀中間一張身份嚟睇";
    this.en["ROLE_WAKE_UP_MINION"] = "你可以確認場上嘅狼人";
    this.en["ROLE_WAKE_UP_MASON"] = "你可以確認場上嘅守夜人";
    this.en["ROLE_WAKE_UP_SEER"] = "你可以揀一個玩家或者中間兩張身份嚟睇";
    this.en["ROLE_WAKE_UP_ROBBER"] = "你可以揀一個玩家同佢對調身份, 你會知道對調後嘅身份係乜嘢";
    this.en["ROLE_WAKE_UP_TROUBLEMAKER"] = "你可以揀兩個玩家嘅牌嚟對調, 揀多一次同一個人可以重新選擇";
    this.en["ROLE_WAKE_UP_DRUNK"] = "你要揀中間一隻牌同自己對調, 但你唔會知道果隻係咩身份";
    this.en["ROLE_WAKE_UP_INSOMNIAC"] = "你再睇一次自己最後嘅身份係乜嘢";
    this.en["ROLE_WAKE_UP_VILLAGER"] = "你冇嘢需要做, 最緊要醒目";
    this.en["ROLE_WAKE_UP_TANNER"] = "你要令其他人殺你";
    this.en["ROLE_WAKE_UP_HUNTER"] = "當你死嘅時候, 你所投票嘅人會一齊死";

    this.en["SET_LANG"] = `${Emoji.get('robot_face')}  Select language`;
    this.en["LANG_SET"] = `${Emoji.get('robot_face')}  Language set !`;
    this.en["GAME_FOUND"] = `${Emoji.get('no_entry_sign')}  Sorry. There is a game start in this channel, please \/join the game`;
    this.en["NEW_GAME"] = `${Emoji.get('star')}  Created a new game, please \/join the game or \/start the game.`;
    this.en["GAME_TERMINATED"] = `${Emoji.get('bomb')}  Game terminated.`;
    this.en["GAME_ERROR_PLAYER_NOT_ENOUGH"] = `${Emoji.get('no_entry_sign')} At least 3 player to start the game.`;
    this.en["GAME_ROLE_LIST"] = `The game has following roles:\n`;
    this.en["ASK_NEW_GAME"] = `${Emoji.get('bomb')}  Sorry. Please create a new game (/newgame)`;
    this.en["GAME_STARTED"] = `${Emoji.get('no_entry_sign')}  Sorry. The game has been started, please wait until next game`;
    this.en["ASK_SETTING"] = `${Emoji.get('no_entry_sign')}  Sorry. Please run /setting first`;
    this.en["GAME_START"] = `${Emoji.get('game_die')}  Game start`;
    this.en["TOO_MANY_PLAYER"] = `${Emoji.get('no_entry_sign')} Too many player joined already ! Please wait for next game!`;
    this.en["PLAYER_LIST"] = `Player joined, You can use \/start to start the game:\n`;
    this.en["TOKEN_LIST"] = `Player and Claimed role:\n`;
    this.en["TOKEN_UNKNOWN"] = `Unknown`;
    this.en["WAIT_FOR_START"] = `${Emoji.get('microphone')} Wait for player to \/start... `;
    this.en["VOTE_BLANK"] = "Blank vote";
    this.en["PLAYER_VOTED"] = "(Voted)";
    this.en["VOTE_LIST"] = `${Emoji.get('arrow_right')}  Voting list ${Emoji.get('arrow_left')}`;
    this.en["GAME_CHECK_ROLE"] = `${Emoji.get('eyeglasses')}  Everyone, please check your role. The game has below role\n  `;
    this.en["GAME_VIEW_ROLE"] = `View your role${Emoji.get("black_joker")}`;
    this.en["NOTIFY_ROLE"] = `Your role is `;
    this.en["GAME_NIGHT_START"] = `${Emoji.get('crescent_moon')}  Night start, Everyone close your eye.`;
    this.en["GAME_DAY_START"] = `${Emoji.get('hourglass_flowing_sand')}  Everyone wake up, use \/showtoken to mark yourself. You can discuss for `;
    this.en["GAME_DAY_START_VOTE"] = `mins... \/vote at `;
    this.en["GAME_DAY_DOZED"] = `Action History`;
    this.en["VOTE_START"] = `${Emoji.get('alarm_clock')}  Time\'s up. Everyone please vote.`;
    this.en["INVALID_ACTION"] = `${Emoji.get('middle_finger')}  Hey! Stop doing that!`;
    this.en["VOTE_ERROR"] = `Invalid player selected !`;
    this.en["COUNT_DOWN"] = `${Emoji.get('microphone')} You still have `;
    this.en["ACTION_STACK"] = `Action Stack: `;

    this.en["ROLE_WAKE_UP"] = ", wake up. ";
    this.en["ROLE_ALREADY_CHOOSE"] = "You already make your choice.";
    this.en["ROLE_INVALID_ACTION"] = "Invalid action";
    this.en["ROLE_ACTION_WAKE_UP"] = `Wake Up${Emoji.get('eyes')}`;
    this.en["ROLE_ACTION_VIEW_ERROR"] = "You cannot view the card.";
    this.en["ROLE_ACTION_ROLE_NOT_EXISTS"] = " not exists";
    
    this.en["ROLE_ACTION_DOPPELGANGER"] = "cloned";
    this.en["ROLE_ACTION_COPYCAT"] = "cloned";
    this.en["ROLE_ACTION_ROLE_PLAYER"] = "Player:";
    this.en["ROLE_ACTION_WATCH_TABLE"] = "Table:";
    this.en["ROLE_ACTION_WEREWOLF_VIEW_ERROR"] = "You cannot view the card in centre.";
    this.en["ROLE_ACTION_ROBBER"] = "robbed";
    this.en["ROLE_ACTION_INSOMNIAC"] = "Your role now";
    this.en["ROLE_ACTION_TROUBLEMAKER_ERROR"] = "Buddy, You cannot choose yourself.";
    this.en["ROLE_ACTION_TROUBLEMAKER_FIRST"] = `Choose 1 more player to swap with `;
    this.en["ROLE_ACTION_TROUBLEMAKER_CANCEL"] = "You have cancelled, choose 2 players to swap.";

    this.en["DOZED_ROLE"] = `Your original role: `;
    this.en["DOZED_ACTION"] = `Action: `;
    
    this.en["RESULT_PLAYERS"] = `Players (Original${Emoji.get('arrow_right')}Final ${Emoji.get('point_left')}Total Vote)`;
    this.en["RESULT_DEATHS"] = `Death (Original${Emoji.get('arrow_right')}Final ${Emoji.get('point_left')}Total Vote)`;
    this.en["RESULT_WINNERS"] = `Winner (Original${Emoji.get('arrow_right')}Final ${Emoji.get('point_right')}Voted)`;
    this.en["RESULT_LOSERS"] = `Loser (Original${Emoji.get('arrow_right')}Final ${Emoji.get('point_right')}Voted)`;

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

    this.zhHK["ROLE_WAKE_UP_COPYCAT"] = "你可以揀中間一張身份然後複製果個身份, 到果個身份行動嘅時候, 你需要起身做佢嘅行動";
    this.zhHK["ROLE_WAKE_UP_DOPPELGANGER"] = "你可以揀一個玩家然後複製佢嘅身份\n如果你係${RoleClass.SEER.emoji}${RoleClass.ROBBER.emoji}${RoleClass.TROUBLEMAKER.emoji}${RoleClass.DRUNK.emoji}, 立即執行你嘅行動\n如果你係${RoleClass.WEREWOLF.emoji}${RoleClass.MINION.emoji}${RoleClass.MASON.emoji}${RoleClass.INSOMNIAC.emoji}, 到果個身份行動嘅時候, 你需要起身做佢嘅行動";
    this.zhHK["ROLE_WAKE_UP_WEREWOLF"] = "你可以確認場上嘅狼人, 如果只有你一位狼人, 你可以揀中間一張身份嚟睇";
    this.zhHK["ROLE_WAKE_UP_MINION"] = "你可以確認場上嘅狼人";
    this.zhHK["ROLE_WAKE_UP_MASON"] = "你可以確認場上嘅守夜人";
    this.zhHK["ROLE_WAKE_UP_SEER"] = "你可以揀一個玩家或者中間兩張身份嚟睇";
    this.zhHK["ROLE_WAKE_UP_ROBBER"] = "你可以揀一個玩家同佢對調身份, 你會知道對調後嘅身份係乜嘢";
    this.zhHK["ROLE_WAKE_UP_TROUBLEMAKER"] = "你可以揀兩個玩家嘅牌嚟對調, 揀多一次同一個人可以重新選擇";
    this.zhHK["ROLE_WAKE_UP_DRUNK"] = "你要揀中間一隻牌同自己對調, 但你唔會知道果隻係咩身份";
    this.zhHK["ROLE_WAKE_UP_INSOMNIAC"] = "你再睇一次自己最後嘅身份係乜嘢";
    this.zhHK["ROLE_WAKE_UP_VILLAGER"] = "你冇嘢需要做, 最緊要醒目";
    this.zhHK["ROLE_WAKE_UP_TANNER"] = "你要令其他人殺你";
    this.zhHK["ROLE_WAKE_UP_HUNTER"] = "當你死嘅時候, 你所投票嘅人會一齊死";

    this.zhHK["SET_LANG"] = `${Emoji.get('robot_face')}  選擇語言`;
    this.zhHK["LANG_SET"] = `${Emoji.get('robot_face')}  語言設定完成`;
    this.zhHK["GAME_FOUND"] = `${Emoji.get('no_entry_sign')}  有人開咗局喇, 你可以用 \/join 加入遊戲`;
    this.zhHK["NEW_GAME"] = `${Emoji.get('star')} 開咗局新遊戲, 其他人可以用 \/join 加入遊戲 或 \/start 嚟開始遊戲`;
    this.zhHK["GAME_TERMINATED"] = `${Emoji.get('bomb')}  遊戲中止`;
    this.zhHK["GAME_ERROR_PLAYER_NOT_ENOUGH"] = `${Emoji.get('no_entry_sign')}  需要最少3位玩家開局.`;
    this.zhHK["GAME_ROLE_LIST"] = `呢局遊戲有以下嘅角色:\n`;
    this.zhHK["ASK_NEW_GAME"] = `${Emoji.get('bomb')}  未有人開局喎, 你可以用 \/newgame 嚟開一局新嘅`;
    this.zhHK["GAME_STARTED"] = `${Emoji.get('no_entry_sign')} 開咗波喇, 等下一局啦`;
    this.zhHK["ASK_SETTING"] = `${Emoji.get('no_entry_sign')}  請先設定遊戲 \/setting`;
    this.zhHK["GAME_START"] = `${Emoji.get('game_die')}  遊戲開始`;
    this.zhHK["TOO_MANY_PLAYER"] = `${Emoji.get('no_entry_sign')} 太多人喇! 等下一局啦`;
    this.zhHK["PLAYER_LIST"] = `以下玩家己加入, 用 \/start 嚟開始遊戲:\n`;
    this.zhHK["TOKEN_LIST"] = `玩家 - 身份(自稱):\n`;
    this.zhHK["TOKEN_UNKNOWN"] = `不明`;
    this.zhHK["WAIT_FOR_START"] = `${Emoji.get('microphone')} 等全部人準備好 \/start ... `;
    this.zhHK["VOTE_BLANK"] = "白票";
    this.zhHK["PLAYER_VOTED"] = "(已投票)";
    this.zhHK["VOTE_LIST"] = `${Emoji.get('arrow_right')} 投票 ${Emoji.get('arrow_left')}`;
    this.zhHK["GAME_CHECK_ROLE"] = `${Emoji.get('eyeglasses')} 大家可以開牌睇自己嘅身份, 呢局遊戲有以下嘅角色\n  `;
    this.zhHK["GAME_VIEW_ROLE"] = `開牌${Emoji.get("black_joker")}`;
    this.zhHK["NOTIFY_ROLE"] = `你嘅身份係 `;
    this.zhHK["GAME_NIGHT_START"] = `${Emoji.get('crescent_moon')} 夜深喇, 夠鐘瞓覺喇, 大家合埋眼`;
    this.zhHK["GAME_DAY_START"] = `${Emoji.get('hourglass_flowing_sand')}  天光喇 起身喇, 用 \/showtoken 去標記你嘅身份. 你地可以傾 `;
    this.zhHK["GAME_DAY_START_VOTE"] = `分鐘... \/vote 投票時間係 `;
    this.zhHK["GAME_DAY_DOZED"] = `行動紀錄`;
    this.zhHK["VOTE_START"] = `${Emoji.get('alarm_clock')} 夠鐘喇, 大家要投票喇`;
    this.zhHK["INVALID_ACTION"] = `${Emoji.get('middle_finger')} 喂! 唔好亂禁好喎!`;
    this.zhHK["VOTE_ERROR"] = `你唔可以投呢個人喎 !`;
    this.zhHK["COUNT_DOWN"] = `${Emoji.get('microphone')} 你仲有 `;
    this.zhHK["ACTION_STACK"] = `行動順序: `;

    this.zhHK["ROLE_WAKE_UP"] = ", 起身喇 ! ";
    this.zhHK["ROLE_ALREADY_CHOOSE"] = "你揀左喇喎 !";
    this.zhHK["ROLE_INVALID_ACTION"] = "行動錯誤 !";
    this.zhHK["ROLE_ACTION_WAKE_UP"] = `起身${Emoji.get('eyes')}`;
    this.zhHK["ROLE_ACTION_VIEW_ERROR"] = "你唔可以睇呢張牌喎";
    this.zhHK["ROLE_ACTION_ROLE_NOT_EXISTS"] = " 冇人";

    this.zhHK["ROLE_ACTION_DOPPELGANGER"] = "複製";
    this.zhHK["ROLE_ACTION_COPYCAT"] = "複製";
    this.zhHK["ROLE_ACTION_ROLE_PLAYER"] = "玩家:";
    this.zhHK["ROLE_ACTION_WATCH_TABLE"] = "檯中間嘅牌:";
    this.zhHK["ROLE_ACTION_WEREWOLF_VIEW_ERROR"] = "你唔可以睇檯中間嘅牌喎";
    this.zhHK["ROLE_ACTION_ROBBER"] = "拎左";
    this.zhHK["ROLE_ACTION_INSOMNIAC"] = "最後嘅身份係";
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_ERROR"] = "老友, 你唔可以掉你自己架喎";
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_FIRST"] = `揀多一個人嚟換 `;
    this.zhHK["ROLE_ACTION_TROUBLEMAKER_CANCEL"] = "你取消咗喇, 重新揀兩個人嚟對調啦";

    this.zhHK["DOZED_ROLE"] = `你原本嘅身份係: `;
    this.zhHK["DOZED_ACTION"] = `行動: `;

    this.zhHK["RESULT_PLAYERS"] = `玩家 (初始身份${Emoji.get('arrow_right')}最後身份 ${Emoji.get('point_left')}總票數)`;
    this.zhHK["RESULT_DEATHS"] = `死亡玩家 (初始身份${Emoji.get('arrow_right')}最後身份 ${Emoji.get('point_left')}總票數)`;
    this.zhHK["RESULT_WINNERS"] = `贏家 (初始身份${Emoji.get('arrow_right')}最後身份 ${Emoji.get('point_right')}投票目標)`;
    this.zhHK["RESULT_LOSERS"] = `輸家 (初始身份${Emoji.get('arrow_right')}最後身份 ${Emoji.get('point_right')}投票目標)`;
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