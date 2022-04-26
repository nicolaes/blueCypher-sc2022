import {loc} from "./models/Map";

export type heroCommand = string | null;

export function heroMove(hero: number, to: loc) {
    let [x, y] = to;
    return `MOVE ${x} ${y}`;
}

export function heroWait(hero: number, initialHeroLocs: loc[]) {
    const [x, y] = initialHeroLocs[hero];
    return `MOVE ${x} ${y}`;
}

export function heroWind() {
    return `SPELL WIND ${17630 / 2} ${9000 / 2}`;
}
