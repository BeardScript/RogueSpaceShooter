import * as RE from 'rogue-engine';
import { Box3, Object3D } from 'three';

const {Prop} = RE;

export default class Collider extends RE.Component {
  @Prop("String") tag: string;
  @Prop("Boolean") isStatic: boolean = true;

  collidingWith: Collider[] = [];
  collisionsThisFrame: Collider[] = [];
  bounds: {
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    zMin: number,
    zMax: number,
  };

  private onCollisionEnterCallbacks: ((collider: Collider) => void)[] = [];
  private onCollisionStayCallbacks: ((collider: Collider) => void)[] = [];
  private onCollisionExitCallbacks: ((collider: Collider) => void)[] = [];

  awake() {
    this.calculateCollisionPoints(this.object3d);
  }

  afterUpdate() {
    this.detectCollisions();
    this.detectEndedCollisions();
  }

  onCollisionEnter(callback: (collider: Collider) => void) {
    this.onCollisionEnterCallbacks.push(callback);
  }

  onCollisionStay(callback: (collider: Collider) => void) {
    this.onCollisionStayCallbacks.push(callback);
  }

  onCollisionExit(callback: (collider: Collider) => void) {
    this.onCollisionExitCallbacks.push(callback);
  }

  private calculateCollisionPoints(object: Object3D) { 
    const bbox = new Box3().setFromObject(object);

    this.bounds = {
      xMin: bbox.min.x,
      xMax: bbox.max.x,
      yMin: bbox.min.y,
      yMax: bbox.max.y,
      zMin: bbox.min.z,
      zMax: bbox.max.z,
    };
  }

  private iterateComponents(callbak: (component: RE.Component)=>void) {
    if(!RE.components) return;
    
    for(let objectUUID in RE.components) {
      const objectComponents = RE.components[objectUUID];
      if(!objectComponents) return;

      for(let i = 0; i < objectComponents.length; i++) {
        const component = objectComponents[i];
        callbak(component);
      }
    }
  }

  private detectCollisions() {
    this.collisionsThisFrame = [];
    this.calculateCollisionPoints(this.object3d);
    if(!this.bounds) return;

    this.iterateComponents((component: RE.Component) => {
      if(component instanceof Collider) {
        if(!component.bounds || component === this) return;

        if (
          this.bounds.xMin <= component.bounds.xMax &&
          this.bounds.xMax >= component.bounds.xMin &&
          this.bounds.yMin <= component.bounds.yMax &&
          this.bounds.yMax >= component.bounds.yMin &&
          this.bounds.zMin <= component.bounds.zMax &&
          this.bounds.zMax >= component.bounds.zMin
        ) {
          // Colliding!!
          this.collisionsThisFrame.push(component);
          const isEnter = this.collidingWith.find((collider)=> collider === component) === undefined;
          
          this.runCollisionCallbacks(component, isEnter);

          if(!this.isStatic) { 
            this.pushBackFromCollidingObject(component);
          }
        }
      }
    });
  }

  private detectEndedCollisions() {
    const endedCollisions: Collider[] = [];

    for (let i = 0; i < this.collidingWith.length; i++) {
      const currentCollider = this.collidingWith[i];

      if (this.collisionsThisFrame.find((collider) => collider === currentCollider ) === undefined ) {
        endedCollisions.push(currentCollider);
      }
    }

    for (let i = 0; i < endedCollisions.length; i++) {
      let collider = endedCollisions[i];
      this.collidingWith.splice(this.collidingWith.indexOf(collider), 1);

      for (const callback of this.onCollisionExitCallbacks) {
        callback(collider);
      }
    }
  }

  private runCollisionCallbacks(collider: Collider, isEnter?: boolean) {
    if (isEnter) {
      for (const callback of this.onCollisionEnterCallbacks) {
        callback(collider);
      }
      this.collidingWith.push(collider);
    }

    for (const callback of this.onCollisionStayCallbacks) {
      callback(collider);
    }
  }

  private pushBackFromCollidingObject(collider: Collider) {
    let colliderCenterZ: number | undefined;
    let thisCenterZ: number | undefined;
    // Move the object in the clear. Detect the best direction to move.
    if (this.bounds.xMin <= collider.bounds.xMax && this.bounds.xMax >= collider.bounds.xMin) {
      // Determine center then push out accordingly.
      const objectCenterX = ((collider.bounds.xMax - collider.bounds.xMin) / 2) + collider.bounds.xMin;
      const thisCenterX = ((this.bounds.xMax - this.bounds.xMin) / 2) + this.bounds.xMin;
      colliderCenterZ = ((collider.bounds.zMax - collider.bounds.zMin) / 2) + collider.bounds.zMin;
      thisCenterZ = ((this.bounds.zMax - this.bounds.zMin) / 2) + this.bounds.zMin;

      // Determine the X axis push.
      if (objectCenterX > thisCenterX) {
        this.object3d.position.x -= 1;
      } else {
        this.object3d.position.x += 1;
      }
    }
    if (this.bounds.zMin <= collider.bounds.zMax && this.bounds.zMax >= collider.bounds.zMin) {
      // Determine the Z axis push.
      if (colliderCenterZ && thisCenterZ && colliderCenterZ > thisCenterZ) {
        this.object3d.position.z -= 1;
      } else {
        this.object3d.position.z += 1;
      }
    }
  }
}

RE.registerComponent(Collider);
