export interface RoleInterface {
  id: number;
  role: string;
  useAbility();
}

export interface RoleOptions {
  id: number;
  role?: string;
}

export class Role implements RoleInterface {
  id: number;
  role: string;

  DOPPELGANGER: string = 'doppelganger';
  WEREWOLF = 'werewolf';
  MINION = 'minion';
  MASON = 'mason';
  SEER = 'seer';
  ROBBER = 'robber';
  TROUBLEMAKER = 'troublemaker';
  DRUNK = 'drunk';
  INSOMNIAC = 'insomniac';
  VILLAGER = 'villager';
  TANNER = 'tanner';
  HUNTER = 'hunter';
  
  constructor(options: RoleOptions) {
    this.id = options.id;
    this.role = options.role;
  }

  useAbility() {
    throw new Error('UseAbility function does not implemented');
  }
}