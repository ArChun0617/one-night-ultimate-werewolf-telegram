import { Role } from "./role";

interface WerewolfOptions {
  id: number;
  name: string;
}

export class Werewolf extends Role {
  constructor(options: WerewolfOptions) {
    super({
      id: options.id,
      role: Role.WEREWOLF,
      name: options.name
    });
  }

  useAbility() {
    // notify buddies
    // IF single wolf, sendMessage Three buttons to choose
    // on callback_query lock the card
  }
}
