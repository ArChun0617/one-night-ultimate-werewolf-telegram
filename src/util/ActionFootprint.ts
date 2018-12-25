import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Player } from "../player/player";
import { RoleClass } from "../role/role";

export class ActionFootprint {
  player: Player;
  choice: string;
  dozed: boolean;
  action: string;
  
  constructor(_player: Player, _choice: string = "", _action: string = "", _dozed: boolean = false) {
    this.player = _player;
    this.choice = _choice;
    this.action = _action;

    this.dozed = _dozed;
  }

  public toString = (): string => {
    return (this.action ? (this.dozed ? `${Emoji.get('zzz')}  ` : "") + this.action : "");
  }

  public toDetailString = (newbieMode: boolean = false): string => {
    let rolePrefix = "";
    let role: any;
    if (this.player.getOriginalRole().code == RoleClass.DOPPELGANGER.code || this.player.getOriginalRole().code == RoleClass.COPYCAT.code ) {
      role = this.player.getOriginalRole();
      rolePrefix = (role.shadowChoice ? role.shadowChoice.emoji : "");
    }
    return `${(newbieMode ? this.player.getOriginalRole().fullName : this.player.getOriginalRole().emoji)}${rolePrefix}${this.player.name} : ${this.toString()}`
  }
}