import * as _ from 'lodash';
import { Role, RoleClass, RoleClassInterface } from '../role/role';
import { Werewolf } from "../role/werewolf";
import { Copycat } from "../role/copycat";
import { Doppelganger } from "../role/doppelganger";
import { Minion } from "../role/minion";
import { Mason } from "../role/mason";
import { Seer } from "../role/seer";
import { Robber } from "../role/robber";
import { Troublemaker } from "../role/troublemaker";
import { Drunk } from "../role/drunk";
import { Insomniac } from "../role/insomniac";
import { Villager } from "../role/villager";
import { Tanner } from "../role/tanner";
import { Hunter } from "../role/hunter";
import { Deck } from "./deck";

export const DeckFactory = {
  /**
   * 
   * @param gameRoles
   * @returns {Deck}
   */
  generate: (gameRoles: RoleClassInterface[]): Deck => {
    const roleWorker: RoleFactory = new RoleFactory();
    gameRoles = _.shuffle(gameRoles);
    const roles: Role[] = [];

    _.map(gameRoles, (role) => {
      roles.push(roleWorker.createRoleByInterface(role));
    });

    return new Deck(roles);
  },

  createRoleByCode: (roleName: string): Role => {
    const roleWorker: RoleFactory = new RoleFactory();
    return roleWorker.createRoleByCode(roleName);
  }
};

export class RoleFactory {
  createRoleByCode(roleName: string): Role {
    let r: Role;
    switch (roleName.toUpperCase()) {
      case RoleClass.COPYCAT.code:
        r = new Copycat();
        break;
      case RoleClass.DOPPELGANGER.code:
        r = new Doppelganger();
        break;
      case RoleClass.WEREWOLF.code:
        r = new Werewolf();
        break;
      case RoleClass.MINION.code:
        r = new Minion();
        break;
      case RoleClass.MASON.code:
        r = new Mason();
        break;
      case RoleClass.SEER.code:
        r = new Seer();
        break;
      case RoleClass.ROBBER.code:
        r = new Robber();
        break;
      case RoleClass.TROUBLEMAKER.code:
        r = new Troublemaker();
        break;
      case RoleClass.DRUNK.code:
        r = new Drunk();
        break;
      case RoleClass.INSOMNIAC.code:
        r = new Insomniac();
        break;
      case RoleClass.VILLAGER.code:
        r = new Villager();
        break;
      case RoleClass.TANNER.code:
        r = new Tanner();
        break;
      case RoleClass.HUNTER.code:
        r = new Hunter();
        break;
      default:
        break;
    }
    return r;
  }
  
  createRoleByInterface(roleInterface: RoleClassInterface): Role {
    return this.createRoleByCode(roleInterface.code);
  }
}
