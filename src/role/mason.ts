import { Role } from "./role";

export class Mason extends Role {
  constructor() {
    super({
      name: Role.MASON
    });
  }

  wakeUp() {
    // notify buddies
  }
}
