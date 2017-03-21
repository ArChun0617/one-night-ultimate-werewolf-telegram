import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Player } from "../player/player";

export class ActionFootprint {
  player: Player;
  choice: string;
  action: string;
  
  constructor(_player: Player, _choice: string, _action: string) {
    this.player = _player;
    this.choice = _choice;
    this.action = _action;
  }
}