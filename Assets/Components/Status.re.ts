import * as RE from 'rogue-engine';

const {Prop} = RE;

export default class Status extends RE.Component {
  @Prop("Number") hp: number = 5;

  state: "normal" | "destroyed" = "normal";
  currentHP: number = 0;

  awake() {
    this.currentHP = this.hp;
  }

  update() {
    if(this.currentHP <= 0) {
      this.state = "destroyed";
    }
  }
}

RE.registerComponent(Status);
