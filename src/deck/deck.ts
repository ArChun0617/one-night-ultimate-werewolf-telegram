import * as _ from 'lodash';
import { Role } from "../role/role";

export class Deck {
  private roles: Role[];

  constructor(roles: Role[]) {
    this.roles = roles;
  }

  shuffle() {
    _.shuffle(this.roles);
  }

  getRoles(): Role[] {
    return this.roles;
  }
}
