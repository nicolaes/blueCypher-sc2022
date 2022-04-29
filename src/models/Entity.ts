import {Player} from "./Player";
import {distance, Loc} from "./Map";
import {MOB_DAMAGE_RANGE, MOB_FOCUS_RANGE, MOB_SPEED, Threat} from "../const";

export enum EntityType {
    Mob,
    MyHero,
    OtherHero
}

export class Entity {
    MY_BASE = 1;
    OTHER_BASE = 2;

    distanceFromMyBase: number;
    loc: Loc;
    nextLoc: Loc;
    threat: Threat;

    constructor(
        public id: number,
        public type: EntityType,
        public x: number,
        public y: number,
        public shieldLife: number,
        public isControlled: number,
        public health: number,
        public vx: number,
        public vy: number,
        public nearBase: number,
        public threatFor: number,
        private me: Player
    ) {
        this.loc = [x, y];
        this.nextLoc = [x + vx, y + vy];
        this.distanceFromMyBase = distance(this.loc, me.loc);
        this.threat = this.computeThreatLevel();
    }

    isDangerousForMyBase = (): boolean => {
        return this.threatFor === this.MY_BASE;
    };

    private computeThreatLevel(): Threat {
        if (this.distanceFromMyBase <= MOB_DAMAGE_RANGE + MOB_SPEED + 1) {
            return Threat.WILL_DAMAGE;
        }

        if (
            this.distanceFromMyBase >= MOB_FOCUS_RANGE - MOB_SPEED + 1 &&
            this.threatFor === this.MY_BASE
        ) {
            return Threat.WILL_FOCUS_BASE;
        }

        if (this.nearBase && this.threatFor === this.MY_BASE) {
            return Threat.FOCUSES_BASE;
        }
    }
}


