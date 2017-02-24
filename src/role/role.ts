import * as Emoji from 'node-emoji';

export interface RoleInterface {
  emoji: string;
  name: string;
  wakeUp(bot, msg, players, table);
  notifyRole(bot, msg);
}

export interface RoleOptions {
  emoji: string;
  name: string;
}

export class Role implements RoleInterface {
  emoji: string;
  name: string;

  public static DOPPELGANGER:string = 'Doppelganger';
  public static WEREWOLF:string = 'Werewolf';
  public static MINION:string = 'Minion';
  public static MASON:string = 'Mason';
  public static SEER:string = 'Seer';
  public static ROBBER:string = 'Robber';
  public static TROUBLEMAKER:string = 'Troublemaker';
  public static DRUNK:string = 'Drunk';
  public static INSOMNIAC:string = 'Insomniac';
  public static VILLAGER:string = 'Villager';
  public static TANNER:string = 'Tanner';
  public static HUNTER:string = 'Hunter';
  
  public static DOPPELGANGER_EMOJI:string = `${Emoji.get('ghost')}`;
  public static WEREWOLF_EMOJI:string = `${Emoji.get('smirk_cat')}`;
  public static MINION_EMOJI:string = `${Emoji.get('dog')}`;
  public static MASON_EMOJI:string = `${Emoji.get('two_men_holding_hands')}`;
  public static SEER_EMOJI:string = `${Emoji.get('crystal_ball')}`;
  public static ROBBER_EMOJI:string = `${Emoji.get('knife')}`;
  public static TROUBLEMAKER_EMOJI:string = `${Emoji.get('smiling_imp')}`;
  public static DRUNK_EMOJI:string = `${Emoji.get('beer')}`;
  public static INSOMNIAC_EMOJI:string = `${Emoji.get('alarm_clock')}`;
  public static VILLAGER_EMOJI:string = `${Emoji.get('boy')}`;
  public static TANNER_EMOJI:string = `${Emoji.get('hammer')}`;
  public static HUNTER_EMOJI:string = `${Emoji.get('gun')}`;
  
  constructor(options: RoleOptions) {
    this.emoji = options.emoji;
    this.name = options.name;
  }

  wakeUp(bot, msg, players, table) {
    throw new Error('UseAbility function does not implemented');
  }

  notifyRole(bot, msg) {
    bot.answerCallbackQuery(msg.id, `Your role is ${this.emoji}${this.name}`);
  }
}