import * as RE from 'rogue-engine';
import { Vector3, Vector2, Plane, Raycaster } from 'three';

const {Prop} = RE;

export default class FolowMouseController extends RE.Component {
  @Prop("Number") speed: number = 0.5;
  @Prop("Number") accDistance: number = 50;
  @Prop("Number") mouseMoveDist: number = 13;

  private raycaster: Raycaster;
  private plane: Plane;
  private pointOfIntersection: Vector3;

  start() {
    this.plane = new Plane(new Vector3(0, 1, 0), 0);
    this.raycaster = new Raycaster();
    this.pointOfIntersection = new Vector3();
  }

  update() {
    let rect = (document.getElementById("scene-window") as HTMLElement).getBoundingClientRect();

    let mouse: Vector2 = new Vector2(
      ( ( RE.Input.mouse.x - rect.left ) / rect.width ) * 2 - 1,
      -( ( RE.Input.mouse.y - rect.top ) / rect.height ) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, RE.Runtime.camera);
    this.raycaster.ray.intersectPlane(this.plane, this.pointOfIntersection);

    this.pointOfIntersection.setY(0);
    let mousePosition = this.pointOfIntersection;

    const distanceToMouse = this.object3d.position.distanceTo(mousePosition);

    if (distanceToMouse > this.mouseMoveDist) {
      let actualSpeed = (distanceToMouse * this.speed) / this.accDistance;
      actualSpeed = actualSpeed > this.speed ? this.speed : actualSpeed;

      this.object3d.translateZ(actualSpeed);
    }

    this.object3d.lookAt(mousePosition);
  }
}

RE.registerComponent(FolowMouseController);
