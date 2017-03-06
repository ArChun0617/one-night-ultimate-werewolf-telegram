import { Role, RoleInterface } from "./role";

export class Doppelganger extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.DOPPELGANGER_EMOJI,
      name: Role.DOPPELGANGER,
      ordering: 10
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // clone a user
    // apply that role ability
  }

  useAbility(bot, msg, players, table, host) {

  }

  endTurn(bot, msg, players, table, host) {

  }
}
