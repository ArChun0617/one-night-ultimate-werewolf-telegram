import { Role } from "./role";

interface MasonOptions {
  id: number;
  name: string;
}

export class Mason extends Role {
  constructor(options: MasonOptions) {
    super({
      id: options.id,
      role: Role.MASON,
      name: options.name
    });
  }

  useAbility() {
    // notify buddies
  }
}
