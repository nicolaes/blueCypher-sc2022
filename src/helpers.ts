import {Loc} from "./models/Map";

export enum HeroAction {
    WAIT = 'WAIT',
    MOVE = 'MOVE',
    SPELL = 'SPELL',
}

export enum HeroSpell {
    WIND = 'WIND',
    CONTROL = 'CONTROL',
    SHIELD = 'SHIELD',
}

export const MELEE_RANGE = 800;
export const MOB_BASE_RANGE = 300;
export const MOB_SPEED = 400;

export type heroCommand = string | null;

export function heroMove(hero: number, to: Loc) {
    let [x, y] = to;
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWait(hero: number, initialHeroLocs: Loc[]) {
    const [x, y] = initialHeroLocs[hero];
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWind() {
    return `${HeroAction.SPELL} ${HeroSpell.WIND} ${17630 / 2} ${9000 / 2}`;
}
