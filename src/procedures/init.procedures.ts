import {Entity} from "../models/Entity";

export function sortMobs(mobs: Entity[]) {
    mobs.sort((a, b) => {
        // Near base first
        if (a.nearBase !== b.nearBase) {
            return b.nearBase - a.nearBase;
        }

        // Prioritize danger
        if (a.isDangerousForMyBase() !== b.isDangerousForMyBase()) {
            return a.isDangerousForMyBase() ? -1 : 1;
        }

        // Depriorities ones targeting enemies
        if (a.isDangerousForOtherBase() !== b.isDangerousForOtherBase()) {
            return a.isDangerousForOtherBase() ? 1 : -1;
        }

        return a.distanceFromMyBase - b.distanceFromMyBase
    })
}

export function sortHeroes(heroes: Entity[]) {
    heroes.sort((a, b) => a.id - b.id);
}
