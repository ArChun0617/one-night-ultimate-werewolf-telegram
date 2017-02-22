import { Role } from "./role";

interface InsomniacOptions {
  id: number;
  name: string;
}

export class Insomniac extends Role {
  constructor(options: InsomniacOptions) {
    super({
      id: options.id,
      role: Role.INSOMNIAC,
      name: options.name
    });
  }

  useAbility() {
    // sendMessage [view] click to know the final role
  }
}
