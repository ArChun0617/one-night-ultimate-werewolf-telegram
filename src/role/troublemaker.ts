import { Role } from "./role";

interface TroublemakerOptions {
  id: number;
  name: string;
}

export class Troublemaker extends Role {
  constructor(options: TroublemakerOptions) {
    super({
      id: options.id,
      role: Role.TROUBLEMAKER,
      name: options.name
    });
  }

  useAbility() {
    // sendMessage [Player1 <> Player2] [Player1 <> Player3] ...
  }
}
