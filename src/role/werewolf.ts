import { Role } from "./role";

export class Werewolf extends Role {
  constructor() {
    super({
      name: Role.WEREWOLF
    });
  }

  useAbility() {
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
  }
}
