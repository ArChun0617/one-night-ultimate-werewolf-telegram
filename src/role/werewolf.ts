import { Role } from "./role";

export class Werewolf extends Role {
  constructor() {
    super({
      name: Role.WEREWOLF
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
  }
}
