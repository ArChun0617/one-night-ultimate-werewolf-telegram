import { Role } from "./role";

interface TannerOptions {
  id: number;
  name: string;
}

export class Tanner extends Role {
  constructor(options: TannerOptions) {
    super({
      id: options.id,
      role: Role.TANNER,
      name: options.name
    });
  }

  useAbility() {

  }
}
