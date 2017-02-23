import { Role } from "./role";

export class Mason extends Role {
  constructor() {
    super({
      name: Role.MASON
    });
  }

  useAbility() {
    // notify buddies
  }
}
