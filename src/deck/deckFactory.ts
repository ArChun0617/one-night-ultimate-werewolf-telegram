import * as _ from 'lodash';
import { Role } from '../role/role';
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
  generate: (gameRoles): Deck => {
    const roles:Role[] = [];

    _.map(gameRoles, (role) => {
      switch (role) {
        case Role.DOPPELGANGER:
          roles.push(new Doppelganger());
          break;
        case Role.WEREWOLF:
          roles.push(new Werewolf());
          break;
        case Role.MINION:
          roles.push(new Minion());
          break;
        case Role.MASON:
          roles.push(new Mason());
          break;
        case Role.SEER:
          roles.push(new Seer());
          break;
        case Role.ROBBER:
          roles.push(new Robber());
          break;
        case Role.TROUBLEMAKER:
          roles.push(new Troublemaker());
          break;
        case Role.DRUNK:
          roles.push(new Drunk());
          break;
        case Role.INSOMNIAC:
          roles.push(new Insomniac());
          break;
        case Role.VILLAGER:
          roles.push(new Villager());
          break;
        case Role.TANNER:
          roles.push(new Tanner());
          break;
        case Role.HUNTER:
          roles.push(new Hunter());
          break;
        default:
          return;
      }
    });

    return new Deck(roles);
  }
};