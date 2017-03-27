import { Role, RoleInterface, RoleClass } from "./role";

export class Hunter extends Role implements RoleInterface {
  constructor() {
    super(RoleClass.HUNTER);
  }

  wakeUp(bot, msg, players, table, host) {
    console.log(`${this.name} wake up called`);
    // use only on vote phrase
    // kill the people when user vote
  }

  useAbility(bot, msg, players, table, host) {
    console.log(`${this.name} useAbility.msg.data: ${msg.data}`);
    return null;
  }

  endTurn(bot, msg, players, table, host) {
    console.log(`${this.name} endTurn`);
    return null;
  }
}
