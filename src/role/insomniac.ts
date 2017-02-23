import { Role } from "./role";

export class Insomniac extends Role {
  constructor() {
    super({
      name: Role.INSOMNIAC
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [view] click to know the final role
  }
}
