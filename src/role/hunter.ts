import { Role } from "./role";

interface HunterOptions {
  id: number;
  name: string;
}

export class Hunter extends Role {
  constructor(options: HunterOptions) {
    super({
      id: options.id,
      role: Role.HUNTER,
      name: options.name
    });
  }

  useAbility() {
    // use only on vote phrase
    // kill the people when user vote
  }
}
