import * as RE from 'rogue-engine';
    
export default class Status extends RE.Component {
  hp: number = 5;
  state: "normal" | "destoryed" = "normal";
  currentHP: number = 0;

  static interface: RE.ComponentInterface = {
    hp: "Number",
  };

  awake() {
    this.currentHP = this.hp;
  }

  update() {
    if(this.currentHP <= 0) {
      this.state = "destoryed";
    }
  }
}

RE.registerComponent(Status);
