import {Player} from "./models/Player";
import {Entity, EntityType} from "./models/Entity";
import {heroControl, heroMove, heroDefend, heroWind, heroWait, heroShield} from "./helpers";
import {distance, Loc} from "./models/Map";
import {heroCommand, heroesPerPlayer, MELEE_RANGE, SIGHT_RANGE, Threat} from "./const";
import {sortHeroes, sortMobs} from "./procedures/init.procedures";

export class Game {
    me: Player;
    enemy: Player;
    entities: Entity[];
    mobs: Entity[] = [];
    myHeroes: Entity[] = [];
    otherHeroes: Entity[] = [];

    heroCommands: heroCommand[] = [null, null, null];
    initialHeroLocs: Loc[];

    enemyControlledMyHero = false;

    constructor(baseX: number, baseY: number, private heroes: number) {
        this.me = new Player(baseX, baseY, 3, 0);
        this.enemy = new Player(
            baseX === 0 ? 17630 : 0,
            baseY === 0 ? 9000 : 0,
            3,
            0
        );

        this.initialHeroLocs = [[5700, 4700], [5500, 2500], [2500, 5500]];
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

    initialize() {
        sortMobs(this.mobs);
        sortHeroes(this.myHeroes);
    }

    get availableHeroes(): Entity[] {
        return this.myHeroes.filter((_, id) => this.heroCommands[id] === null);
    }

    computeActions = () => {
        // Attack first mobs
        for (let i = 0; i < heroesPerPlayer; i++) {
            if (this.mobs.length) {
                const closestMob: Entity = this.mobs.shift();

                const closestHeroes = this.availableHeroes
                    .sort((h1, h2) =>
                        distance(h1.loc, closestMob.loc) - distance(h2.loc, closestMob.loc));
                const closestHero = closestHeroes[0];

                this.heroCommands[closestHero.id] = this.decideClosestHeroAction(closestHero, closestMob);
            }
        }
    }

    otherHeroInRange(hero: Entity) {
        return this.otherHeroes.some(other => distance(other.loc, hero.loc) < SIGHT_RANGE + 1);
    }

    decideClosestHeroAction(hero: Entity, closestMob: Entity): heroCommand {
        if (hero.isControlled) {
            if (!this.enemyControlledMyHero) {
                this.enemyControlledMyHero = true;
            }
            return heroWait();
        }
        // === ^^^ WAIT IF UNDER CONTROL ^^^ ==============================


        if (closestMob.threat === Threat.WILL_DAMAGE && closestMob.shieldLife === 0) {
            return heroWind();
        }
        //=== ^^^ DEFENSIVE WIND ^^^ ======================================

        if (
            this.enemyControlledMyHero &&
            hero.shieldLife === 0 &&
            this.me.mana >= 20 &&
            this.otherHeroInRange(hero)
        ) {
            return heroShield(hero.id);
        }

        //=== ^^^ DEFENSIVE HERO SHIELD ^^^ =================

        if (
            this.me.mana > 100 &&
            closestMob.threat === Threat.WILL_FOCUS_BASE &&
            distance(hero.loc, closestMob.loc) < SIGHT_RANGE
        ) {
            return heroControl(closestMob.id, this.enemy.loc);
        }
        //=== ^^^ CONTROL MOB ^^^ ===================================

        // Consider attacks close mobs too
        for (let i = 0; i < this.mobs.length; i++) {
            if (distance(this.mobs[i].loc, closestMob.loc) <= MELEE_RANGE) {
                this.mobs.splice(i, 1);
            }
        }

        return heroMove(hero.id, closestMob.loc);
    }

    nextAction = (hero: number): string => {
        return this.heroCommands[hero] || heroDefend(hero, this.initialHeroLocs);
    };
}
