
import { Role } from "../role/role";

export class Table {
  private left: Role;
  private center: Role;
  private right: Role;

  setRoles(roles: Role[]) {
    this.setLeft(roles.shift());
    this.setCenter(roles.shift());
    this.setRight(roles.shift());
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

  getLeft() {
    return this.left;
  }

  getCenter() {
    return this.center;
  }

  getRight() {
    return this.right;
  }
}
