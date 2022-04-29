import {Loc} from "./Map";

export class Player {
    loc: Loc;

    constructor(
        public basePosX: number,
        public basePosY: number,
        public baseHealth: number,
        public mana: number
    ) {
        this.loc = [basePosX, basePosY];
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
