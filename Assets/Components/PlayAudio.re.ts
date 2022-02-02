import * as RE from 'rogue-engine';
import { Audio } from 'three';

const {Prop} = RE;

export default class PlayAudio extends RE.Component {
  @Prop("Audio") sound: Audio;
  @Prop("Number") volume: number = 1;

  start() {
    this.sound.setVolume(this.volume);
    this.sound.setLoop(true);
    this.sound && this.sound.play();
  }
}

RE.registerComponent(PlayAudio);
