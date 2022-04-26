import {loc} from "./Map";

export class Player {
    xy: loc;

    constructor(
        public basePosX: number,
        public basePosY: number,
        public baseHealth: number,
        public mana: number
    ) {
        this.xy = [basePosX, basePosY];
    }

    setHealth = (value: number) => {
        this.baseHealth = value;
    };
    setMana = (value: number) => {
        this.mana = value;
    };
    canCast = (): boolean => {
        return this.mana >= 10;
    };
}
