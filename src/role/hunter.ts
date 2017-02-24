import { Role } from "./role";

export class Hunter extends Role {
  constructor() {
    super({
      emoji: Role.HUNTER_EMOJI,
      name: Role.HUNTER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);
    // use only on vote phrase
    // kill the people when user vote
  }
}
