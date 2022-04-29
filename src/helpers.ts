import {loc} from "./models/Map";

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

export type heroCommand = string | null;

export function heroMove(hero: number, to: loc) {
    let [x, y] = to;
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWait(hero: number, initialHeroLocs: loc[]) {
    const [x, y] = initialHeroLocs[hero];
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWind() {
    return `${HeroAction.SPELL} ${HeroSpell.WIND} ${17630 / 2} ${9000 / 2}`;
}
