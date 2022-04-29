export type Loc = [number, number];

export function distance(a: Loc, b: Loc): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
