import { Role } from "./role";

export class Doppelganger extends Role {
  constructor() {
    super({
      name: Role.DOPPELGANGER
    });
  }

  wakeUp() {
    // clone a user
    // apply that role ability
  }
}
