export interface RoleInterface {
  name: string;
  wakeUp(bot, msg, players, table);
  notifyRole(bot, msg);
}

export interface RoleOptions {
  name: string;
}

export class Role implements RoleInterface {
  name: string;

  public static DOPPELGANGER:string = 'doppelganger';
  public static WEREWOLF:string = 'werewolf';
  public static MINION:string = 'minion';
  public static MASON:string = 'mason';
  public static SEER:string = 'seer';
  public static ROBBER:string = 'robber';
  public static TROUBLEMAKER:string = 'troublemaker';
  public static DRUNK:string = 'drunk';
  public static INSOMNIAC:string = 'insomniac';
  public static VILLAGER:string = 'villager';
  public static TANNER:string = 'tanner';
  public static HUNTER:string = 'hunter';
  
  constructor(options: RoleOptions) {
    this.name = options.name;
  }

  wakeUp(bot, msg, players, table) {
    throw new Error('UseAbility function does not implemented');
  }

  notifyRole(bot, msg) {
    bot.answerCallbackQuery(msg.id, `Your role is ${this.name}`);
  }
}