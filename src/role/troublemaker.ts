import * as _ from 'lodash';
import { Role, RoleInterface } from "./role";
import { Player } from "../player/player";

export class Troublemaker extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.TROUBLEMAKER_EMOJI,
      name: Role.TROUBLEMAKER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
  }

  useAbility(bot, msg, players, table) {

  }

  endTurn(bot, msg, players, table) {

  }
}
