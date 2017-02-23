import { Role } from "./role";

export class Villager extends Role {
  constructor() {
    super({
      name: Role.VILLAGER
    });
  }

  useAbility() {

  }
}
