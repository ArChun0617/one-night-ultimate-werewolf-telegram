import { Role } from "./role";

interface VillagerOptions {
  id: number;
  name: string;
}

export class Villager extends Role {
  constructor(options: VillagerOptions) {
    super({
      id: options.id,
      role: Role.VILLAGER,
      name: options.name
    });
  }

  useAbility() {

  }
}
