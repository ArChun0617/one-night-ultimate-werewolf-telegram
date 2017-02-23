import { Role } from "./role";

export class Mason extends Role {
  constructor() {
    super({
      name: Role.MASON
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // notify buddies
  }
}
