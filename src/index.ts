import {Entity} from "./models/Entity";
import {Game} from "./Game";

declare const readline: () => any;

 // The corner of the map representing your base
const [baseX, baseY] = readline().split(" ").map(Number);
const heroesPerPlayer: number = Number(readline()); // Always 3
const game = new Game(baseX, baseY, heroesPerPlayer);

// game loop
while (true) {
    const myBaseInput: number[] = readline().split(" ").map(Number);
    const enemyBaseInput: number[] = readline().split(" ").map(Number);
    game.newTurn(
        myBaseInput[0],
        myBaseInput[1],
        enemyBaseInput[0],
        enemyBaseInput[1]
    );

    const entityCount: number = Number(readline()); // Amount of heros and monsters you can see
    for (let i = 0; i < entityCount; i++) {
        const inputs: number[] = readline().split(" ").map(Number);
        game.addEntity(
            new Entity(
                inputs[0], // Unique identifier
                inputs[1], // 0=monster, 1=your hero, 2=opponent hero
                inputs[2], // Position of this entity
                inputs[3],
                inputs[4], // Ignore for this league; Count down until shield spell fades
                inputs[5], // Ignore for this league; Equals 1 when this entity is under a control spell
                inputs[6], // Remaining health of this monster
                inputs[7], // Trajectory of this monster
                inputs[8],
                inputs[9], // 0=monster with no target yet, 1=monster targeting a base
                inputs[10], // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
                game.me
            )
        );
    }

    game.computeActions();

    for (let i = 0; i < heroesPerPlayer; i++) {
        console.log(game.nextAction(i));
    }
}
