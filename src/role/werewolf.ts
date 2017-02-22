import { Role } from "./role";

interface WerewolfOptions {
  id: number;
}

export class Werewolf extends Role {
  constructor(options: WerewolfOptions) {
    super({
      id: options.id,
      role: Role.WEREWOLF
    });
  }

  useAbility() {
    
  }
}
