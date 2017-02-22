import { Role } from "./role";

interface DoppelgangerOptions {
  id: number;
  name: string;
}

export class Doppelganger extends Role {
  constructor(options: DoppelgangerOptions) {
    super({
      id: options.id,
      role: Role.DOPPELGANGER,
      name: options.name
    });
  }

  useAbility() {
    // clone a user
    // apply that role ability
  }
}
