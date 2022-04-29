import {Loc} from "./models/Map";
import {HeroAction, HeroSpell} from "./const";

export function heroMove(hero: number, to: Loc) {
    let [x, y] = to;
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWait() {
    return HeroAction.WAIT;
}

export function heroDefend(hero: number, initialHeroLocs: Loc[]) {
    const [x, y] = initialHeroLocs[hero];
    return `${HeroAction.MOVE} ${x} ${y}`;
}

export function heroWind() {
    return `${HeroAction.SPELL} ${HeroSpell.WIND} ${17630 / 2} ${9000 / 2}`;
}

export function heroControl(entityId: number, loc: Loc) {
    return `${HeroAction.SPELL} ${HeroSpell.CONTROL} ${entityId} ${loc[0]} ${loc[1]}`;
}

export function heroShield(entityId: number) {
    return `${HeroAction.SPELL} ${HeroSpell.SHIELD} ${entityId}`;
}
