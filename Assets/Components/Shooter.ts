import * as RE from 'rogue-engine';
import { Object3D, Audio } from 'three';
import Collider from './Collider';
  
export default class Shooter extends RE.Component {
  projectile: RE.Prefab;
  refresh: number = 0;
  sound: Audio;
  volume: number = 1;

  private timer: number = 0;
  private collider: Collider;

  static interface: RE.ComponentInterface = {
    projectile: "Prefab",
    refresh: "Number",
    sound: "Audio",
    volume: "Number",
  };

  start() {
    this.collider = RE.getComponentByName("Collider", this.object3d) as Collider;
  }

  update() {
    if (this.timer < this.refresh) {
      this.timer += RE.Runtime.deltaTime * 1000;
    }
  }

  shoot() {
    if(this.timer >= this.refresh && this.projectile) {
      const parent = RE.App.currentScene.getObjectByName("Projectiles")
      const projectile: Object3D = this.projectile.instantiate(parent);

      if (!projectile) return;

      if (this.sound && this.sound.context.state === "running") {
        this.sound.isPlaying && this.sound.stop();
        this.sound.setVolume(this.volume);
        this.sound.play();
      }

      if (this.collider) {
        const collider = RE.getComponentByName("Collider", projectile);
        if(collider instanceof Collider)
          collider.tag = this.collider.tag;
      }

      projectile.position.copy(this.object3d.position);
      projectile.rotation.copy(this.object3d.rotation);

      this.timer = 0;
    }
  }
}

RE.registerComponent(Shooter);
