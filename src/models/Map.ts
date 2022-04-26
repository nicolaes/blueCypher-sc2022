export type loc = [number, number];

export function distance(a: loc, b: loc): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
