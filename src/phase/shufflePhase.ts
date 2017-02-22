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

export const ShufflePhase = {
  assignRoles: (players, gameRoles) => {
    players = _.shuffle(players);

    const roles = [];

    _.map(gameRoles, (role) => {
      const player = players.shift();
      const option = {
        id: player.id,
        name: player.name
      };

      switch (role) {
        case Role.DOPPELGANGER:
          roles.push(new Doppelganger(option));
          break;
        case Role.WEREWOLF:
          roles.push(new Werewolf(option));
          break;
        case Role.MINION:
          roles.push(new Minion(option));
          break;
        case Role.MASON:
          roles.push(new Mason(option));
          break;
        case Role.SEER:
          roles.push(new Seer(option));
          break;
        case Role.ROBBER:
          roles.push(new Robber(option));
          break;
        case Role.TROUBLEMAKER:
          roles.push(new Troublemaker(option));
          break;
        case Role.DRUNK:
          roles.push(new Drunk(option));
          break;
        case Role.INSOMNIAC:
          roles.push(new Insomniac(option));
          break;
        case Role.VILLAGER:
          roles.push(new Villager(option));
          break;
        case Role.TANNER:
          roles.push(new Tanner(option));
          break;
        case Role.HUNTER:
          roles.push(new Hunter(option));
          break;
        default:
          return;
      }
    });

    return roles;
  }
};
