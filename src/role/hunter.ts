import { Role } from "./role";

export class Hunter extends Role {
  constructor() {
    super({
      name: Role.HUNTER
    });
  }

  useAbility() {
    // use only on vote phrase
    // kill the people when user vote
  }
}
