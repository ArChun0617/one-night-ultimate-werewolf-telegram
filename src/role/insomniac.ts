import { Role } from "./role";

export class Insomniac extends Role {
  constructor() {
    super({
      name: Role.INSOMNIAC
    });
  }

  wakeUp() {
    // sendMessage [view] click to know the final role
  }
}
