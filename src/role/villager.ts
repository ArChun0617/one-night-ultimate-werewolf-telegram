import { Role } from "./role";

export class Villager extends Role {
  constructor() {
    super({
      emoji: Role.VILLAGER_EMOJI,
      name: Role.VILLAGER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);

  }
}
