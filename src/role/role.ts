import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Player } from "../player/player";
import { Table } from "../npc/table";
import { ActionFootprint } from "../util/ActionFootprint";
import { Language } from "../util/language";

export class RoleClassInterface {
  emoji: string;
  code: string;
  name: string;
  max_per_game: number;
  ordering: number;

  constructor(_emoji: string, _code: string, _max_per_game: number, _ordering: number) {
    this.emoji = _emoji;
    this.code = _code;
    this.max_per_game = _max_per_game;
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
  checkRole(roleName: RoleClassInterface[], chkShadow: boolean);
}

export class RoleClass {
  public static COPYCAT: RoleClassInterface = new RoleClassInterface(`${Emoji.get('beer')}`, 'ROLE_COPYCAT', 1, 9);
  public static DOPPELGANGER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('ghost')}`, 'ROLE_DOPPELGANGER', 1, 10);
  public static WEREWOLF: RoleClassInterface = new RoleClassInterface(`${Emoji.get('smirk_cat')}`, 'ROLE_WEREWOLF', 2, 20);
  public static MINION: RoleClassInterface = new RoleClassInterface(`${Emoji.get('dog')}`, 'ROLE_MINION', 1, 30);
  public static MASON: RoleClassInterface = new RoleClassInterface(`${Emoji.get('two_men_holding_hands')}`, 'ROLE_MASON', 2, 40);
  public static SEER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('crystal_ball')}`, 'ROLE_SEER', 1, 50);
  public static ROBBER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('knife')}`, 'ROLE_ROBBER', 1, 60);
  public static TROUBLEMAKER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('smiling_imp')}`, 'ROLE_TROUBLEMAKER', 1, 70);
  public static DRUNK: RoleClassInterface = new RoleClassInterface(`${Emoji.get('beer')}`, 'ROLE_DRUNK', 1, 80);
  public static INSOMNIAC: RoleClassInterface = new RoleClassInterface(`${Emoji.get('alarm_clock')}`, 'ROLE_INSOMNIAC', 1, 90);
  public static VILLAGER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('boy')}`, 'ROLE_VILLAGER', 3, 999);
  public static TANNER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('hammer')}`, 'ROLE_TANNER', 1, 997);
  public static HUNTER: RoleClassInterface = new RoleClassInterface(`${Emoji.get('gun')}`, 'ROLE_HUNTER', 1, 998);
}

export class Role implements RoleInterface {
  emoji: string;
  code: string;
  name: string;
  choice: string;
  actionEvt: ActionFootprint;
  ordering: number;
  lang: Language;

  get fullName(): string {
    return this.emoji + this.name;
  }
    
  constructor(roleClass: RoleClassInterface) {
    this.lang = new Language();

    this.emoji = roleClass.emoji;
    this.code = roleClass.code;
    this.ordering = roleClass.ordering;

    this.name = this.lang.getString(this.code);// roleClass.name;
  }

  setLang = (_lang: string) => {
    this.lang.setLang(_lang);
    this.name = this.lang.getString(this.code);
  }

  wakeUp(bot, msg, players, table) {
    throw new Error('WakeUp function does not implemented');
  }

  useAbility(bot, msg, players, table, host): ActionFootprint {
    throw new Error('UseAbility function does not implemented');
  }

  endTurn(bot, msg, players, table, host): ActionFootprint {
    throw new Error('UseAbility function does not implemented');
  }

  notifyRole(bot, msg) {
    bot.showNotification(msg.id, this.lang.getString("NOTIFY_ROLE") + this.fullName);
  }

  checkRole(roleName: RoleClassInterface[], chkShadow: boolean = true) {  //chkShadow is used for doppelganger, for other role no difference
    //return _.includes(_.map(roleName, (r: RoleClassInterface) => r.code), this.code);
    return !!(_.find(roleName, { code: this.code }));
  }
}