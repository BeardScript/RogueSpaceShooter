import * as RE from 'rogue-engine';
import Collider from './Collider';
import Status from './Status';

export default class Projectile extends RE.Component {
  speed: number = 5;
  travelTime: number = 1000;
  damage: number = 20;

  private elapsedTime: number = 0;
  private collider: Collider;

  static interface: RE.ComponentInterface = {
    speed: "Number",
    travelTime: "Number",
  };

  start() {
    this.collider = RE.getComponentByName("Collider", this.object3d) as Collider;
    this.detectCollisions();
  }

  update() {
    this.elapsedTime += RE.Runtime.deltaTime * 1000;

    if (this.elapsedTime < this.travelTime) {
      this.object3d.translateZ(this.speed * RE.Runtime.deltaTime);
    } else {
      this.object3d.parent?.remove(this.object3d);
    }
  }

  detectCollisions() {
    if (!this.collider) return;

    this.collider.onCollisionEnter(collider => {
      if (collider.tag === this.collider.tag) return;

      const targetStatus = RE.getComponent(Status, collider.object3d);
      targetStatus && this.applyDamage(targetStatus);

      this.object3d.parent?.remove(this.object3d);
    });
  }

  applyDamage(targetStatus: Status) {
    if (!targetStatus) return;
    targetStatus.currentHP -= this.damage;
  }
}

RE.registerComponent(Projectile);
