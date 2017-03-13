import { Role, RoleInterface } from "./role";

export class Tanner extends Role implements RoleInterface {
  constructor() {
    super({
      emoji: Role.TANNER_EMOJI,
      name: Role.TANNER,
      ordering: 997
    });
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);

  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);

  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);

  }
}
