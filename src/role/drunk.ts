import { Role } from "./role";

export class Drunk extends Role {
  constructor() {
    super({
      name: Role.DRUNK
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [left] [center] [right], choose one of the center card to exchange
  }
}
