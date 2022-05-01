export const heroesPerPlayer = 3;

export enum Threat {
    WILL_DAMAGE,
    FOCUSES_BASE,
    WILL_FOCUS_BASE, // includes mobs that can leave base focus in 1 turn
    NONE
}

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

export const SIGHT_RANGE = 2200;
export const WIND_RANGE = 1200;
export const MELEE_RANGE = 800;
export const MOB_DAMAGE_RANGE = 300;
export const MOB_FOCUS_RANGE = 5000;
export const MOB_SPEED = 400;
export const HERO_SPEED = 800;

export type heroCommand = string | null;
