import {Entity} from "./Entity";

export type Loc = [number, number];

export function distance(a: Loc, b: Loc): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function getPositionFromBase(position: Loc, base: Loc): Loc {
    const loc: Loc = (base[0] === 0)
        ? position
        : [base[0] - position[0], base[1] - position[1]];
    return loc.map(Math.round) as Loc;
}

export function closestFirstSorting(closestTo: Loc) {
    return (a: Entity, b: Entity) => {
        return distance(a.loc, closestTo) - distance(b.loc, closestTo);
    };
}
