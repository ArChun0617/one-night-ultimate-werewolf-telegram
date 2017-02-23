
import { Role } from "../role/role";

export class Table {
  private left: Role = null;
  private center: Role = null;
  private right: Role = null;

  pickRole(roles: Role[]): Role[] {
    if (this.left || this.center || this.right) {
      throw new Error('Table cards has been there');
    }

    this.left = roles.shift();
    this.center = roles.shift();
    this.right = roles.shift();
    
    return roles;
  }

  setLeft(role: Role) {
    this.left = role;
  }

  setCenter(role: Role) {
    this.center = role;
  }

  setRight(role: Role) {
    this.right = role;
  }
}
