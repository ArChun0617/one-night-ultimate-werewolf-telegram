import { Role } from "./role";

export class Doppelganger extends Role {
  constructor() {
    super({
      name: Role.DOPPELGANGER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // clone a user
    // apply that role ability
  }
}
