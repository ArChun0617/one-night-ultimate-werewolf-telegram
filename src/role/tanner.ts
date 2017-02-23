import { Role } from "./role";

export class Tanner extends Role {
  constructor() {
    super({
      name: Role.TANNER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);

  }
}
