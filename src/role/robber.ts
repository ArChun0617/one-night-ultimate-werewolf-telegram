import { Role } from "./role";

export class Robber extends Role {
  constructor() {
    super({
      name: Role.ROBBER
    });
  }

  useAbility() {
    // sendMessage [Player1] [Player2] [DO NOTHING] ...
    // lock the option when callback_query to notify the new role
  }
}
