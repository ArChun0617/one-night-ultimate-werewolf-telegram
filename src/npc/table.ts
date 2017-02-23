
import { Role } from "../role/role";

export class Table {
  private roles: Role[] = [];

  setRoles(roles: Role[]) {
    this.roles.push(roles.shift());
    this.roles.push(roles.shift());
    this.roles.push(roles.shift());
  }

  getRoles(): Role[] {
    return this.roles;
  }

  setLeft(role: Role) {
    this.roles[0] = role;
  }

  setCenter(role: Role) {
    this.roles[1] = role;
  }

  setRight(role: Role) {
    this.roles[2] = role;
  }

  getLeft() {
    return this.roles[0];
  }

  getCenter() {
    return this.roles[1];
  }

  getRight() {
    return this.roles[2];
  }
}
