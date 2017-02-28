import { Role, RoleInterface } from "./role";

export class Hunter extends Role implements RoleInterface {
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

  useAbility(bot, msg, players, table) {
    console.log(`${this.name} useAbility:`, msg);

  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);

  }
}
