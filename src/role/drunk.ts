import { Role } from "./role";

interface DrunkOptions {
  id: number;
  name: string;
}

export class Drunk extends Role {
  constructor(options: DrunkOptions) {
    super({
      id: options.id,
      role: Role.DRUNK,
      name: options.name
    });
  }

  useAbility() {
    // sendMessage [left] [center] [right], choose one of the center card to exchange
  }
}
