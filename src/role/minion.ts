import { Role } from "./role";

export class Minion extends Role {
  constructor() {
    super({
      name: Role.MINION
    });
  }

  wakeUp() {
    // notify werewolf buddies
  }
}
