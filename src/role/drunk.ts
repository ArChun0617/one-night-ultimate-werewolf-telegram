import { Role } from "./role";

export class Drunk extends Role {
  constructor() {
    super({
      name: Role.DRUNK
    });
  }

  wakeUp() {
    // sendMessage [left] [center] [right], choose one of the center card to exchange
  }
}
