import { Role } from "./role";

export class Werewolf extends Role {
  constructor() {
    super({
      name: Role.WEREWOLF
    });
  }

  wakeUp() {
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
  }
}
