import { Role } from "./role";

interface MinionOptions {
  id: number;
  name: string;
}

export class Minion extends Role {
  constructor(options: MinionOptions) {
    super({
      id: options.id,
      role: Role.MINION,
      name: options.name
    });
  }

  useAbility() {
    // notify werewolf buddies
  }
}
