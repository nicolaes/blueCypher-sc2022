import {Entity} from "./Entity";
import {Player} from "./Player";
import {HERO_DAMAGE, HERO_MELEE_RANGE, HERO_SPEED, MOB_DAMAGE_RANGE, MOB_SPEED, WIND_RANGE} from "../const";

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

export function closestToLocReducer(closestTo: Loc) {
    return (closestEntity: Entity | null, entity: Entity) => {
        if (!closestEntity) return entity;
        return distance(closestEntity.loc, closestTo) < distance(entity.loc, closestTo)
            ? closestEntity : entity;
    }
}

export function turnsUntilMobKilledOrWindedByHero(hero: Entity, mob: Entity, me: Player) {
    const turnsUntilMobDamagesBase = Math.ceil(
        (distance(mob.loc, me.loc) - 1 - MOB_DAMAGE_RANGE) /
        MOB_SPEED
    );

    let turnsUntilHeroWind = Math.ceil(
        (distance(hero.loc, mob.loc) - WIND_RANGE) /
        (HERO_SPEED - MOB_SPEED)
    );
    turnsUntilHeroWind = Math.max(turnsUntilHeroWind, mob.shieldLife);

    let turnsUntilHeroDamage = Math.ceil(
        (distance(hero.loc, mob.loc) - HERO_MELEE_RANGE) /
        (HERO_SPEED - MOB_SPEED)
    ) - 1; // because if you move towards the mob, damage procs even if mob will move too far this turn
    turnsUntilHeroDamage = Math.max(turnsUntilHeroDamage, 0);
    const turnsOfDamageToKill = Math.ceil(mob.health / HERO_DAMAGE);
    const turnsUntilHeroKillsMob = turnsUntilHeroDamage + turnsOfDamageToKill;

    return turnsUntilMobDamagesBase -
        Math.min(turnsUntilHeroWind, turnsUntilHeroKillsMob);
}
