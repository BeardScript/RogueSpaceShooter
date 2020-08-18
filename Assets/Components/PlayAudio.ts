import * as RE from 'rogue-engine';
import { Audio } from 'three';

export default class PlayAudio extends RE.Component {
  sound: Audio;
  volume: number = 1;

  static interface: RE.ComponentInterface = {
    sound: "Audio",
    volume: "Number",
  };

  start() {
    this.sound.setVolume(this.volume);
    this.sound.setLoop(true);
    this.sound && this.sound.play();
  }
}

RE.registerComponent(PlayAudio);
