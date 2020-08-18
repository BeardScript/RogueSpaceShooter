import * as RE from 'rogue-engine';
import { Vector3 } from 'three';
import Status from './Status';

export default class SpaceShooterGameplay extends RE.Component {
  playerPrefab: RE.Prefab;
  enemyPrefab: RE.Prefab;
  maxEnemyShips: number = 2;
  enemySpawnDistance: number = 500;
  score: number = 0;
  gameStarted: boolean = false;
  playerStatus: Status;
  enemyShips: {[uuid:string]: Status} = {};

  static interface: RE.ComponentInterface = {
    playerPrefab: "Prefab",
    enemyPrefab: "Prefab",
    maxEnemyShips: "Number",
    enemySpawnDistance: "Number",
  };

  update() {
    if (this.gameStarted) {
      this.checkPlayerStatus();
      this.checkEnemyStatus();
      this.spawnEnemyShip();
    }
  }

  startGame() {
    this.score = 0;
    RE.Runtime.renderer.compile(RE.App.currentScene, RE.Runtime.camera);

    const player = this.playerPrefab.instantiate();
    if (!player) return;

    this.playerStatus = RE.getComponent(Status, player);
    this.gameStarted = true;
  }

  endGame() {
    this.gameStarted = false;
    for (let uuid in this.enemyShips) {
      const enemiesContainer = RE.App.currentScene.getObjectByName("Enemies");

      const enemy = enemiesContainer?.getObjectByProperty("uuid", uuid);
      enemy && enemiesContainer?.remove(enemy);
    }

    this.enemyShips = {};
  }

  checkPlayerStatus() {
    if (this.playerStatus.currentHP <= 0) {
      this.endGame();
    }
  }

  checkEnemyStatus() {
    const destroyedShips: string[] = [];
    for (let uuid in this.enemyShips) {
      const enemyStatus = this.enemyShips[uuid];

      if(enemyStatus.currentHP <= 0) {
        destroyedShips.push(uuid);
        this.score += 10;
      }
    }

    for(let uuid of destroyedShips) {
      delete this.enemyShips[uuid];
    }
  }

  spawnEnemyShip() {
    const enemiesCount = Object.keys(this.enemyShips).length;

    if (this.enemyPrefab && enemiesCount < this.maxEnemyShips) {
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * this.enemySpawnDistance;
      const z = Math.sin(angle) * this.enemySpawnDistance;

      const spawnPoint = new Vector3(x, 0, z);

      const parent = RE.App.currentScene.getObjectByName("Enemies");
      const enemy = this.enemyPrefab.instantiate(parent);

      if (!enemy) return;

      enemy.position.copy(spawnPoint);

      const shipStatus = RE.getComponent(Status, enemy);
      this.enemyShips[enemy.uuid] = shipStatus;
    }
  }
}

RE.registerComponent(SpaceShooterGameplay);
