
import { Role } from "../role/role";

export class Player {
  private id: number;
  private originalRole: Role = null;
  private role: Role;
  private name: string;

  constructor(options) {
    this.id = options.id;
    this.name = options.name;
  }

  setRole(role: Role) {
    if (!this.originalRole) {
      this.originalRole = role;
    }

    this.role = role;
  }
}
