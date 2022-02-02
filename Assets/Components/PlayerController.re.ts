import * as RE from 'rogue-engine';
import { Vector3, Object3D, Camera, PerspectiveCamera } from 'three';
import Shooter from './Shooter.re';
import Status from './Status.re';

const {Prop} = RE;

export default class PlayerController extends RE.Component {
  @Prop("Number") speed: number = 0.5;
  @Prop("Number") accDistance: number = 50;
  @Prop("Number") cursorMoveDist: number = 13;
  @Prop("Number") cursorSpeed: number = 100;
  @Prop("Prefab") crosshair: RE.Prefab;
  @Prop("Prefab") explosion: RE.Prefab;

  private targetObject: Object3D;
  private lastPosition: Vector3;
  private shooter: Shooter;
  private status: Status;

  start() {
    this.status = RE.getComponentByName("Status", this.object3d) as Status;
    this.shooter = RE.getComponentByName("Shooter", this.object3d) as Shooter;

    if (this.crosshair)
      this.targetObject = this.crosshair.instantiate();
    else {
      this.targetObject = new Object3D();
      RE.App.currentScene.add(this.targetObject);
    }

    this.lastPosition = new Vector3();
  }

  update() {
    if (this.status && this.status.state === "destroyed") {
      this.handleDestroyed();
      return;
    }

    if (!this.targetObject) return;

    this.moveTarget();
    this.rotateTowardsTarget();
    this.move();

    const isShooting = 
      RE.Input.mouse.isLeftButtonDown || 
      RE.Input.keyboard.getKeyPressed("ControlLeft");

    if (this.shooter && isShooting) {
      this.shooter.shoot();
    }
  }

  handleDestroyed() {
    this.explosion.instantiate()?.position.copy(this.object3d.position);
    this.object3d.parent?.remove(this.targetObject);
    this.object3d.parent?.remove(this.object3d);
  }

  moveTarget() {
    const visibleHeight = this.getVisibleHeightAtDepth(this.targetObject.position.y, RE.Runtime.camera);
    const visibleWidth = this.getVisibleWidthAtDepth(visibleHeight, RE.Runtime.camera as PerspectiveCamera);

    const halfWidth = visibleWidth / 2;
    const halfHeight = visibleHeight / 2;
    
    let deltaX = -RE.Input.mouse.movementX / 5;
    let deltaY = -RE.Input.mouse.movementY / 5;

    const xAfterDelta = this.targetObject.position.x + deltaX;
    const yAfterDelta = this.targetObject.position.z + deltaY;

    deltaX = xAfterDelta < -halfWidth ?
      (this.targetObject.position.x + halfWidth)/-2 : deltaX;

    deltaX = xAfterDelta > halfWidth ?
      (this.targetObject.position.x - halfWidth)/-2 : deltaX;

    deltaY = yAfterDelta < -halfHeight ?
      (this.targetObject.position.z + halfHeight)/-2 : deltaY;

    deltaY = yAfterDelta > halfHeight ?
      (this.targetObject.position.z - halfHeight)/-2 : deltaY;

    this.targetObject
      .translateX(deltaX * this.cursorSpeed * RE.Runtime.deltaTime)
      .translateZ(deltaY * this.cursorSpeed * RE.Runtime.deltaTime);
  }

  rotateTowardsTarget() {
    this.object3d.lookAt(this.lastPosition);
    
    this.lastPosition = this.lastPosition.lerp(this.targetObject.position, 0.1);
    this.lastPosition.copy(this.targetObject.position);
  }

  move() {
    const distanceToCursor = this.object3d.position.distanceTo(this.targetObject.position);

    if (distanceToCursor > this.cursorMoveDist) {
      let actualSpeed = (distanceToCursor * this.speed) / this.accDistance;
      actualSpeed = actualSpeed > this.speed ? this.speed : actualSpeed;

      this.object3d.translateZ(actualSpeed * RE.Runtime.deltaTime);
    }
  }

  private getVisibleHeightAtDepth(depth: number, camera: Camera) {
    if( !(camera instanceof PerspectiveCamera) ) return 0;

    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.y;
    if ( depth < cameraOffset ) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = camera.fov * Math.PI / 180; 

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
  }

  private getVisibleWidthAtDepth(height: number, camera: PerspectiveCamera) {
    return height * camera.aspect;
  }
}

RE.registerComponent(PlayerController);
