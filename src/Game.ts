import {Player} from "./models/Player";
import {Entity, EntityType} from "./models/Entity";
import {heroControl, heroDefend, heroMove, heroShield, heroWait, heroWind} from "./helpers";
import {closestFirstSorting, closestToLocReducer, distance, getPositionFromBase, Loc} from "./models/Map";
import {HERO_SPEED, heroCommand, heroesPerPlayer, MELEE_RANGE, MOB_FOCUS_RANGE, SIGHT_RANGE, Threat} from "./const";
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
    myAttackerPatrol: Loc | null = null;

    constructor(baseX: number, baseY: number, private heroes: number) {
        this.me = new Player(baseX, baseY, 3, 0);
        this.enemy = new Player(
            baseX === 0 ? 17630 : 0,
            baseY === 0 ? 9000 : 0,
            3,
            0
        );

        this.initialHeroLocs = [[5700, 4700], [7000, 2700], [3000, 5500]];
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
        if (this.shouldStopAttacking()) {
            this.myAttackerPatrol = null;
        } else if (this.myAttackerPatrol !== null || this.shouldStartAttacking()) {
            const myAttacker = this.myHeroes[0];
            const attackCommand = this.goToEnemyAndCastControl(myAttacker);
            this.setHeroCommand(0, attackCommand);
        }
        //=== ^^^ ATTACK ENEMY BASE

        const mobsForDefenders = this.mobs
            .filter(mob => distance(mob.loc, this.me.loc) < MOB_FOCUS_RANGE + 4000);
        for (let i = 0; i < heroesPerPlayer; i++) {
            const closestMob: Entity = mobsForDefenders.shift();
            if (closestMob) {
                const closestHero = this.availableHeroes.reduce(closestToLocReducer(closestMob.loc), null);

                if (closestHero) {
                    const heroAction = this.decideClosestHeroAction(closestHero, closestMob, mobsForDefenders);
                    this.setHeroCommand(closestHero.id, heroAction);
                }
            }
        }
        //=== ^^^ DEFEND ^^^ ==================================================
    }

    otherHeroInRange(hero: Entity) {
        return this.otherHeroes.some(other => distance(other.loc, hero.loc) < SIGHT_RANGE + 1);
    }

    decideClosestHeroAction(hero: Entity, closestMob: Entity, mobsForDefenders: Entity[]): heroCommand {
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
            this.me.mana > 150 &&
            closestMob.threat === Threat.WILL_FOCUS_BASE &&
            distance(hero.loc, closestMob.loc) < SIGHT_RANGE
        ) {
            return heroControl(closestMob.id, this.enemy.loc);
        }
        //=== ^^^ CONTROL MOB ^^^ ===================================

        // Consider attacks on close mobs too
        for (let i = 0; i < mobsForDefenders.length; i++) {
            if (distance(mobsForDefenders[i].loc, closestMob.loc) <= MELEE_RANGE) {
                mobsForDefenders.splice(i, 1);
            }
        }

        return heroMove(hero.id, closestMob.loc);
    }

    private goToEnemyAndCastControl(myAttacker: Entity) {
        const patrolAround: Loc = getPositionFromBase([4300, 3300], this.enemy.loc);
        const maxDistanceToEnemyBase: number = distance(patrolAround, this.enemy.loc) + 1000;

        // My attacker patrols to:
        if (
            !this.myAttackerPatrol ||
            distance(myAttacker.loc, this.myAttackerPatrol) < HERO_SPEED
        ) {
            const direction = Math.random() * Math.PI / 3 + Math.PI / 12; // 15deg > 75deg
            const distanceFromEnemy = maxDistanceToEnemyBase - 3000 + Math.random() * 3000
            const patrolCoordinates: Loc = [
                Math.cos(direction) * distanceFromEnemy,
                Math.sin(direction) * distanceFromEnemy
            ];
            this.myAttackerPatrol = getPositionFromBase(patrolCoordinates, this.enemy.loc);

            console.error('Patrol direction: ',
                this.myAttackerPatrol, ' - at ',
                distance(this.myAttackerPatrol, this.enemy.loc))
        }

        if (distance(this.myHeroes[0].loc, this.enemy.loc) > maxDistanceToEnemyBase) {
            return heroMove(myAttacker.id, patrolAround);
        }

        const mobsInRange = this.mobs
            .filter(mob => distance(myAttacker.loc, mob.loc) < SIGHT_RANGE)
            .sort(closestFirstSorting(myAttacker.loc));

        const closestMobWithHalfHealth = mobsInRange
            .find(mob =>
                mob.shieldLife === 0 &&
                mob.health >= 10 &&
                !mob.isDangerousForOtherBase()
            );
        if (closestMobWithHalfHealth) {
            return heroControl(closestMobWithHalfHealth.id, this.enemy.loc);
        }

        return heroMove(myAttacker.id, this.myAttackerPatrol);
    }

    shouldStartAttacking(): boolean {
        return this.mobs.filter(mob => mob.threat <= Threat.FOCUSES_BASE).length <= 4 &&
            this.me.mana > 150;
    }

    shouldStopAttacking(): boolean {
        return this.mobs.filter(mob => mob.threat <= Threat.FOCUSES_BASE).length > 6 &&
            this.me.mana < 100;
    }

    setHeroCommand(heroIdOrIndex: number, command: heroCommand) {
        const heroIndex = heroIdOrIndex >= 3 ? heroIdOrIndex - 3 : heroIdOrIndex;
        this.heroCommands[heroIndex] = command;
    }

    nextAction = (hero: number): string => {
        return this.heroCommands[hero] || heroDefend(hero, this.initialHeroLocs);
    };
}
