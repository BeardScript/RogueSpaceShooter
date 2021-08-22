import * as RE from 'rogue-engine';
import { Object3D } from 'three';
import Shooter from './Shooter';
import Status from './Status';

const {Prop} = RE;

export default class AIController extends RE.Component {
  @Prop("Number") speed: number = 1.5;
  @Prop("Number") minEngageDistance: number = 80;
  @Prop("Number") minShootingDistance: number = 200;
  @Prop("Number") maxEscapeDistance: number = 300;
  @Prop("Prefab") explosion: RE.Prefab;

  private isEscaping: boolean = false;
  private escapeSpeed: number = 0;
  private distanceToTarget: number = 0;

  private status: Status;
  private shooter: Shooter;
  private target: Object3D;
  private beacon: Object3D;

  start() {
    this.beacon = new Object3D();
    this.status = RE.getComponentByName("Status", this.object3d) as Status;
    this.shooter = RE.getComponentByName("Shooter", this.object3d) as Shooter;
  }

  update() {
    if (this.status && this.status.state === "destroyed") {
      return this.destroy();
    }

    if (!this.target) {
      this.target = RE.App.currentScene.getObjectByName("Player") as Object3D;
      return;
    }

    this.distanceToTarget = this.object3d.position.distanceTo(this.target.position);

    if (this.shooter && this.distanceToTarget > this.minEngageDistance && !this.isEscaping)
      this.engageTarget();
    else
      this.followEscapeRoute();

    this.object3d.translateZ(this.speed * RE.Runtime.deltaTime * 55);
    this.object3d.lookAt(this.beacon.position);
  }

  destroy() {
    const parent = RE.App.currentScene.getObjectByName("Projectiles");
    this.explosion.instantiate(parent)?.position.copy(this.object3d.position);

    this.object3d.parent?.remove(this.object3d);
  }

  engageTarget() {
    this.beacon.position.copy(this.target.position);

    if (this.shooter && this.distanceToTarget < this.minShootingDistance) {
      this.shooter.shoot();
    }
  }

  followEscapeRoute() {
    if (!this.isEscaping) {
      this.beacon.rotation.copy(this.object3d.rotation);

      const beaconSpeed = this.speed * 1.5;
      const goingRight = Math.random() < 0.5 && Math.random() < 0.5;

      this.escapeSpeed = goingRight ? beaconSpeed : -beaconSpeed;
    }

    this.isEscaping = true;
    this.beacon.translateX(this.escapeSpeed);

    if (this.distanceToTarget > this.maxEscapeDistance)
      this.isEscaping = false;
  }
}

RE.registerComponent(AIController);
