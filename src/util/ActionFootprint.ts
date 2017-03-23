import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Player } from "../player/player";

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
}