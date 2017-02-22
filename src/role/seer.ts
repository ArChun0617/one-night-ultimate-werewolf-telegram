import { Role } from "./role";

interface SeerOptions {
  id: number;
  name: string;
}

export class Seer extends Role {
  constructor(options: SeerOptions) {
    super({
      id: options.id,
      role: Role.SEER,
      name: options.name
    });
  }

  useAbility() {
    // sendMessage [AB] [BC] [AC] [Player1] [Player2] ...
    // lock the option when callback_query
  }
}
