import { Role, RoleInterface } from "./role";

export class Tanner extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.TANNER_EMOJI,
      name: Role.TANNER
    });
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.name} wake up called`);

  }

  useAbility(bot, msg, players, table) {

  }

  endTurn(bot, msg, players, table) {

  }
}
