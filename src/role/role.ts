import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Player } from "../player/player";
import { Table } from "../npc/table";
import { ActionFootprint } from "../util/ActionFootprint";

export class RoleClassInterface {
  emoji: string;
  name: string;
  ordering: number

  constructor(_emoji: string, _name: string, _ordering) {
    this.emoji = _emoji;
    this.name = _name;
    this.ordering = _ordering;
  }
}

export interface RoleInterface {
  choice: string;
  actionEvt: ActionFootprint;
  wakeUp(bot, msg, players: Player[], table: Table, host: Player);
  useAbility(bot, msg, players: Player[], table: Table, host: Player);
  endTurn(bot, msg, players: Player[], table, host: Player);
  notifyRole(bot, msg);
  checkRole(roleName);
}

export class RoleClass {
  public static COPYCAT: RoleClassInterface = new RoleClassInterface(`${Emoji.get('beer')}`, 'Copycat', 9);
  public static DOPPELGANGER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('ghost')}`, 'Doppelganger', 10);
  public static WEREWOLF: RoleClassInterface = new RoleClassInterface(`${Emoji.get('smirk_cat')}`, 'Werewolf', 20);
  public static MINION: RoleClassInterface = new RoleClassInterface(`${Emoji.get('dog')}`, 'Minion', 30);
  public static MASON: RoleClassInterface = new RoleClassInterface(`${Emoji.get('two_men_holding_hands')}`, 'Mason', 40);
  public static SEER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('crystal_ball')}`, 'Seer', 50);
  public static ROBBER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('knife')}`, 'Robber', 60);
  public static TROUBLEMAKER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('smiling_imp')}`, 'Troublemaker', 70);
  public static DRUNK: RoleClassInterface = new RoleClassInterface(`${Emoji.get('beer')}`, 'Drunk', 80);
  public static INSOMNIAC: RoleClassInterface = new RoleClassInterface(`${Emoji.get('alarm_clock')}`, 'Insomniac', 90);
  public static VILLAGER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('boy')}`, 'Villager', 999);
  public static TANNER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('hammer')}`, 'Tanner', 997);
  public static HUNTER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('gun')}`, 'Hunter', 998);
}

export class Role implements RoleInterface {
  emoji: string;
  name: string;
  choice: string;
  actionEvt: ActionFootprint;
  ordering: number;
  get fullName(): string {
    return this.emoji + this.name;
  }
    
  constructor(roleClass: RoleClassInterface) {
    this.emoji = roleClass.emoji;
    this.name = roleClass.name;
    this.ordering = roleClass.ordering;
  }

  wakeUp(bot, msg, players, table, host) {
    throw new Error('WakeUp function does not implemented');
  }

  useAbility(bot, msg, players, table, host): ActionFootprint {
    throw new Error('UseAbility function does not implemented');
  }

  endTurn(bot, msg, players, table, host): ActionFootprint {
    throw new Error('UseAbility function does not implemented');
  }

  notifyRole(bot, msg) {
    bot.showNotification(msg.id, `Your role is ${this.fullName}`);
  }

  checkRole(roleName, chkShadow: boolean = true) {  //chkShadow is used for doppelganger, for other role no difference
    if (roleName instanceof Array)
      return _.includes(_.map(roleName, (r: RoleClassInterface) => r.name.toUpperCase()), this.name.toUpperCase());
    else
      return this.name.toUpperCase() == roleName.name.toUpperCase();
  }
}