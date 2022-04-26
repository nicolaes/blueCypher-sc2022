import {Player} from "./models/Player";
import {Entity} from "./models/Entity";
import {heroCommand, heroMove, heroWait, heroWind} from "./helpers";
import {distance, loc} from "./models/Map";
import {heroesPerPlayer} from "./const";

export class Game {
    ACTION_WAIT = "WAIT";
    ACTION_MOVE = "MOVE";
    ACTION_SPELL = "SPELL";
    SPELL_WIND = "WIND";
    SPELL_CONTROL = "CONTROL";
    SPELL_SHIELD = "SHIELD";

    me: Player;
    enemy: Player;
    entities: Entity[];
    heroCommands: heroCommand[] = [null, null, null];
    initialHeroLocs: loc[];

    constructor(baseX: number, baseY: number, private heroes: number) {
        this.me = new Player(baseX, baseY, 3, 0);
        this.enemy = new Player(
            baseX === 0 ? 17630 : 0,
            baseY === 0 ? 9000 : 0,
            3,
            0
        );

        this.initialHeroLocs = [[5000, 5000], [5500, 2500], [2500, 5500]];
        if (baseX !== 0) {
            this.initialHeroLocs = this.initialHeroLocs.map(([x, y]) => [baseX - x, baseY - y]);
        }

    }

    newTurn = (
        health: number,
        mana: number,
        enemyHealth: number,
        enemyMana: number
    ) => {
        this.me.setHealth(health);
        this.me.setMana(mana);
        this.enemy.setHealth(enemyHealth);
        this.enemy.setMana(enemyMana);
        this.entities = [];
        this.heroCommands = [null, null, null]
    };

    addEntity = (entity: Entity) => {
        this.entities.push(entity);
    };

    computeActions = () => {
        const mobs: Entity[] = this.entities
            .filter(e => e.type === e.TYPE_MONSTER)
            .sort((a, b) => {
                // Near base first
                if (a.nearBase !== b.nearBase) {
                    return b.nearBase - a.nearBase;
                }

                // Prioritize danger
                if (a.isDangerousForMyBase() !== b.isDangerousForMyBase()) {
                    return a.isDangerousForMyBase() ? -1 : 1;
                }

                return a.distanceFromMyBase - b.distanceFromMyBase
            });

        let heroLocs: loc[] = this.entities
            .filter(e => e.type = e.TYPE_MY_HERO)
            .sort((a, b) => a.id - b.id)
            .map(e => [e.x, e.y])

        // Attack first mobs
        for (let i = 0; i < heroesPerPlayer; i++) {
            const availableHeroes = this.heroCommands
                .map((command, heroIndex) => command === null ? heroIndex : null)
                .filter(v => v !== null);

            if (mobs.length) {
                const mob: Entity = mobs.shift();
                const mobLoc: loc = [mob.x, mob.y];
                const closestHeroes = availableHeroes
                    .map(hero => ({hero, distanceToMob: distance(heroLocs[hero], mobLoc)}))
                    .sort((a, b) => a.distanceToMob - b.distanceToMob);
                const closestHero = closestHeroes[0].hero;

                if (distance(mobLoc, this.me.xy) <= 701) {
                    this.heroCommands[closestHero] = heroWind();
                } else {
                    this.heroCommands[closestHero] = heroMove(closestHero, mobLoc);
                }
            }
        }
    }

    nextAction = (hero: number): string => {
        return this.heroCommands[hero] || heroWait(hero, this.initialHeroLocs);
    };
}
