import { Role, RoleOptions } from "./role";

export class Werewolf extends Role {
  constructor(options: RoleOptions) {
    options.role = 'werewolf';
    super(options);
  }

  useAbility() {
    
  }
}
