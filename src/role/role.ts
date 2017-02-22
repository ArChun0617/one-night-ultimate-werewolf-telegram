export interface RoleInterface {
  id: number;
  role: string;
  name: string;
  useAbility();
}

export interface RoleOptions {
  id: number;
  role: string;
  name: string;
}

export class Role implements RoleInterface {
  id: number;
  role: string;
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
    this.id = options.id;
    this.role = options.role;
    this.name = options.name;
  }

  useAbility() {
    throw new Error('UseAbility function does not implemented');
  }
}