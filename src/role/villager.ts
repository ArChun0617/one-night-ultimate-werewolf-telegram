import { Role, RoleInterface, RoleClass } from "./role";

export class Villager extends Role implements RoleInterface {
  constructor() {
    super(RoleClass.VILLAGER);
  }

  wakeUp(bot, msg, players, table) {
    console.log(`${this.code} wake up called`);

  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.code} useAbility.msg.data: ${msg.data}`);
    return null;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.code} endTurn`);
    return null;
  }
}
