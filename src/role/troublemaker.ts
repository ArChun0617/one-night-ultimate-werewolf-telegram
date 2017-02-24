import * as _ from 'lodash';
import { Role } from "./role";
import { Player } from "../player/player";

export class Troublemaker extends Role {
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
}
