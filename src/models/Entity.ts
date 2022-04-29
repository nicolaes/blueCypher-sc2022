import {Player} from "./Player";
import {Loc} from "./Map";

export enum EntityType {
    Mob,
    MyHero,
    OtherHero
}

export class Entity {
    TYPE_MONSTER = 0;
    TYPE_MY_HERO = 1;
    TYPE_OTHER_HERO = 2;
    MY_BASE = 1;
    OTHER_BASE = 2;

    distanceFromMyBase: number;
    loc: Loc;

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
        this.distanceFromMyBase = this.getDistanceFrom(
            this.me.basePosX,
            this.me.basePosY
        );
        this.loc = [x, y];
    }

    isDangerousForMyBase = (): boolean => {
        return this.threatFor === this.MY_BASE;
    };
    getDistanceFrom = (x: number, y: number): number => {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    };
}
