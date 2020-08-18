import * as RE from 'rogue-engine';
import { Vector2 } from 'three';
    
export default class TouchStick extends RE.Component {
  maxLength: number = 50;
  moveThisObject: boolean = false;
  vIsZ: boolean = false;
  objectHSpeed: number = 15;
  objectVSpeed: number = 15;
  hAxis: number = 0;
  vAxis: number = 0;
  body: HTMLElement;
  uiContainer: HTMLElement;

  private touch: RE.TouchInteraction | undefined;
  private stickContainer: HTMLElement;
  private stickOutside: HTMLElement;
  private stick: HTMLElement;
  private delta: Vector2 = new Vector2();

  static interface: RE.ComponentInterface = {
    maxLength: "Number",
    moveThisObject: "Boolean",
    objectHSpeed: "Number",
    objectVSpeed: "Number",
    vIsZ: "Boolean",
  };

  start() {
    this.uiContainer = document.getElementById("rogue-ui") as HTMLElement;
    this.body = document.getElementsByTagName("body")[0];

    this.generateStickElements(this.uiContainer);
    this.stickContainer.style.display = "none";
  }

  update() {
    const startTouch = RE.Input.touch.startTouches[0];

    if (startTouch && this.touch) return;

    if (startTouch && !this.touch) {
      this.handleStartTouch(startTouch);
      return;
    }

    if (this.getEndTouch()) {
      this.handleEndTouch();
      return;
    }

    this.handleTouch()
  }

  handleStartTouch(startTouch: RE.TouchInteraction) {
    this.touch = startTouch;
    this.stickContainer.style.display = "block";

    const uiContainerRect = this.uiContainer.getBoundingClientRect();

    const startX = startTouch.x - uiContainerRect.left;
    const startY = startTouch.y - uiContainerRect.top;

    const xPos = startX - this.stickContainer.clientWidth / 2;
    const yPos = startY - this.stickContainer.clientHeight / 2;

    this.stickContainer.style.left = xPos + "px";
    this.stickContainer.style.top = yPos + "px";

    this.stick.style.transform = `translate3d(0, 0, 0)`;
  }

  handleTouch() {
    const touches = RE.Input.touch.touches;
    const touch = touches.find(touch => this.touch && touch.id === this.touch.id);

    if (touch && this.touch) {
      let deltaX = this.touch.x - touch.x;
      let deltaY = this.touch.y - touch.y;

      this.delta.set(deltaX, deltaY);

      this.delta.clampLength(0, this.maxLength);

      this.moveStick();

      this.hAxis = this.maxLength ? -this.delta.x / this.maxLength : 0;
      this.vAxis = this.maxLength ? this.delta.y / this.maxLength : 0;

      if (this.moveThisObject) {
        const deltaTime = RE.Runtime.deltaTime;
        this.object3d.translateX(this.hAxis * this.objectHSpeed * deltaTime);
        this.object3d.translateZ(this.vAxis * this.objectVSpeed * deltaTime);
      }
    }
  }

  handleEndTouch() {
    this.stickContainer.style.display = "none";
    this.touch = undefined;
  }

  getEndTouch() {
    const endTouches = RE.Input.touch.endTouches;
    return endTouches.find(touch => this.touch && touch.id === this.touch.id);
  }

  moveStick() {
    const deltaX = -this.delta.x + "px";
    const deltaY = -this.delta.y + "px";
    
    this.stick.style.transform = `translate3d(${deltaX}, ${deltaY}, 0)`;
  }

  generateStickElements(target: HTMLElement) {
    this.stickContainer = document.createElement("div");
    this.stickOutside = document.createElement("div");
    this.stick = document.createElement("div");

    this.stickContainer.style.position = "absolute";
    this.stickContainer.style.zIndex = "1000";

    this.stickOutside.style.height = "100px";
    this.stickOutside.style.width = "100px";
    this.stickOutside.style.border = "white 3px solid";
    this.stickOutside.style.borderRadius = "50%";

    this.stick.style.border = "white 3px solid";
    this.stick.style.position = "absolute";
    this.stick.style.width = "84px";
    this.stick.style.height = "84px";
    this.stick.style.borderRadius = "50%";
    this.stick.style.top = "calc(50% - 45px)";
    this.stick.style.left = "calc(50% - 45px)";

    this.stickContainer.appendChild(this.stickOutside);
    this.stickContainer.appendChild(this.stick);

    target.appendChild(this.stickContainer);
  }

  onRemoved() {
    this.stickContainer.remove();
  }
}

RE.registerComponent(TouchStick);
