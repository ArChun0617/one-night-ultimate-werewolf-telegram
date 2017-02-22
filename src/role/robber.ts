import { Role } from "./role";

interface RobberOptions {
  id: number;
  name: string;
}

export class Robber extends Role {
  constructor(options: RobberOptions) {
    super({
      id: options.id,
      role: Role.ROBBER,
      name: options.name
    });
  }

  useAbility() {
    // sendMessage [Player1] [Player2] [DO NOTHING] ...
    // lock the option when callback_query to notify the new role
  }
}
