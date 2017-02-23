import { Role } from "./role";

export class Minion extends Role {
  constructor() {
    super({
      name: Role.MINION
    });
  }

  useAbility() {
    // notify werewolf buddies
  }
}
