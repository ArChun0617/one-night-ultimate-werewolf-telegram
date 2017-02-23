import { Role } from "./role";

export class Troublemaker extends Role {
  constructor() {
    super({
      name: Role.TROUBLEMAKER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
  }
}
