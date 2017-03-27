import * as _ from 'lodash';
import { Role, RoleClass, RoleClassInterface } from '../role/role';
import { Werewolf } from "../role/werewolf";
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
    gameRoles = _.shuffle(gameRoles);
    const roles:Role[] = [];

    _.map(gameRoles, (role) => {
      switch (role) {
        case RoleClass.DOPPELGANGER:
          roles.push(new Doppelganger());
          break;
        case RoleClass.WEREWOLF:
          roles.push(new Werewolf());
          break;
        case RoleClass.MINION:
          roles.push(new Minion());
          break;
        case RoleClass.MASON:
          roles.push(new Mason());
          break;
        case RoleClass.SEER:
          roles.push(new Seer());
          break;
        case RoleClass.ROBBER:
          roles.push(new Robber());
          break;
        case RoleClass.TROUBLEMAKER:
          roles.push(new Troublemaker());
          break;
        case RoleClass.DRUNK:
          roles.push(new Drunk());
          break;
        case RoleClass.INSOMNIAC:
          roles.push(new Insomniac());
          break;
        case RoleClass.VILLAGER:
          roles.push(new Villager());
          break;
        case RoleClass.TANNER:
          roles.push(new Tanner());
          break;
        case RoleClass.HUNTER:
          roles.push(new Hunter());
          break;
        default:
          return;
      }
    });

    return new Deck(roles);
  }
};
