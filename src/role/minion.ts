import { Role } from "./role";

export class Minion extends Role {
  constructor() {
    super({
      name: Role.MINION
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // notify werewolf buddies
  }
}
