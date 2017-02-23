import { Role } from "./role";

export class Troublemaker extends Role {
  constructor() {
    super({
      name: Role.TROUBLEMAKER
    });
  }

  wakeUp() {
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
  }
}
