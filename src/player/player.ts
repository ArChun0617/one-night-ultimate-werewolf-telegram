
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

  pickRole(roles: Role[]): Role[] {
    if (this.originalRole) {
      throw new Error('Player already pick a role.');
    }

    this.originalRole = roles.shift();
    this.role = this.originalRole;
    return roles;
  }

  setRole(role: Role) {
    this.role = role;
  }
}
