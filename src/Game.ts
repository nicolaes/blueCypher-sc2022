import {Player} from "./models/Player";
import {Entity, EntityType} from "./models/Entity";
import {heroCommand, heroMove, heroWait, heroWind, MELEE_RANGE, MOB_BASE_RANGE, MOB_SPEED} from "./helpers";
import {distance, Loc} from "./models/Map";
import {heroesPerPlayer} from "./const";

export class Game {
    me: Player;
    enemy: Player;
    entities: Entity[];
    mobs: Entity[] = [];
    myHeroes: Entity[] = [];
    otherHeroes: Entity[] = [];

    heroCommands: heroCommand[] = [null, null, null];
    initialHeroLocs: Loc[];

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
        this.mobs = [];
        this.myHeroes = [];
        this.otherHeroes = [];
        this.heroCommands = [null, null, null]
    };

    addEntity = (entity: Entity) => {
        this.entities.push(entity);
        switch (entity.type) {
            case EntityType.Mob:
                this.mobs.push(entity);
                break;
            case EntityType.MyHero:
                this.myHeroes.push(entity);
                break;
            case EntityType.OtherHero:
                this.otherHeroes.push(entity);
                break;
            default:
                throw Error('invalid type');
        }
    };

    sortMobs() {
        this.mobs.sort((a, b) => {
            // Near base first
            if (a.nearBase !== b.nearBase) {
                return b.nearBase - a.nearBase;
            }

            // Prioritize danger
            if (a.isDangerousForMyBase() !== b.isDangerousForMyBase()) {
                return a.isDangerousForMyBase() ? -1 : 1;
            }

            return a.distanceFromMyBase - b.distanceFromMyBase
        })
    };

    sortHeroes() {
        this.myHeroes.sort((a, b) => a.id - b.id);
        this.otherHeroes.sort((a, b) => a.id - b.id);
    }

    initialize() {
        this.sortMobs();
        this.sortHeroes();
    }

    get availableHeroes(): Entity[] {
        return this.myHeroes.filter((_, id) => this.heroCommands[id] === null);
    }

    computeActions = () => {
        // Attack first mobs
        for (let i = 0; i < heroesPerPlayer; i++) {
            if (this.mobs.length) {
                const closestMob: Entity = this.mobs.shift();

                // Consider attacks close mobs too
                for (let i = 0; i < this.mobs.length; i++) {
                    if (distance(this.mobs[i].loc, closestMob.loc) <= MELEE_RANGE) {
                        this.mobs.splice(i, 1);
                    }
                }

                const closestHeroes = this.availableHeroes
                    .sort((h1, h2) =>
                        distance(h1.loc, closestMob.loc) - distance(h2.loc, closestMob.loc));
                const closestHero = closestHeroes[0];

                if (distance(closestMob.loc, this.me.xy) <= MOB_BASE_RANGE + MOB_SPEED + 1) {
                    this.heroCommands[closestHero.id] = heroWind();
                } else {
                    this.heroCommands[closestHero.id] = heroMove(closestHero.id, closestMob.loc);
                }
            }
        }
    }

    nextAction = (hero: number): string => {
        return this.heroCommands[hero] || heroWait(hero, this.initialHeroLocs);
    };
}
