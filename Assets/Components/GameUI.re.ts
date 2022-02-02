import * as RE from 'rogue-engine';
import SpaceShooterGameplay from './SpaceShooterGameplay.re';
import { AudioContext } from 'three';
import PlayAudio from './PlayAudio.re';
import Shooter from './Shooter.re';

export default class GameUI extends RE.Component {
  private uiContainer: HTMLElement;
  private loadingUI: HTMLElement;
  private startGameUI: HTMLElement;
  private scoreUI: HTMLElement;
  private shootUI: HTMLImageElement;
  private audioIcon: HTMLImageElement;
  private muteIcon: HTMLImageElement;
  private audioNotice: HTMLElement;
  private healthBarUI: HTMLElement;
  private healthBarIndicator: HTMLElement;
  private hp: HTMLElement;
  private gameOverUI: HTMLElement;
  private finalScoreUI: HTMLElement;

  private playerHealth: number = 0;
  private score: number;
  private spaceShooter: SpaceShooterGameplay;
  private backgroundAudioPlayer: PlayAudio;
  private useTouch: boolean = false;

  start() {
    AudioContext["getContext"]().suspend();

    this.uiContainer = document.getElementById("rogue-ui") as HTMLElement;
    
    const myCss = document.createElement("style");
    myCss.innerHTML = "@import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap');";

    this.uiContainer.appendChild(myCss);
    this.uiContainer.style.fontFamily = "Black Ops One";

    this.createLoadingUI();
    this.createAudioNotice();
    this.createSoundControls();

    this.spaceShooter = RE.getComponentByName("SpaceShooterGameplay") as SpaceShooterGameplay;
    this.backgroundAudioPlayer = RE.getComponentByName("PlayAudio") as PlayAudio;

    this.uiContainer.onclick = () => {
      if (this.spaceShooter.gameStarted && !this.useTouch) {
        RE.Input.mouse.lock();
        this.openFullscreen();
      }
    }
  }

  update() {
    if (
      this.spaceShooter.isReady &&
      this.loadingUI.isConnected &&
      !this.startGameUI
    ) {
      this.loadingUI.style.display = "none";
      this.createStartGameUI();
    }

    if (
      RE.Input.keyboard.getKeyUp("KeyM") &&
      this.spaceShooter.isReady &&
      this.backgroundAudioPlayer &&
      this.backgroundAudioPlayer.isReady
    ) {
      this.toggleSound();
    }
  }

  afterUpdate() {
    if (!this.spaceShooter) return;
    if (!this.spaceShooter.playerStatus) return;

    const curHp = this.spaceShooter.playerStatus.currentHP;
    if (this.playerHealth != curHp) {
      this.playerHealth = curHp;
      let healthPct = (curHp * 100) / this.spaceShooter.playerStatus.hp;
      if (healthPct <= 0) {
        healthPct = 0;
        this.healthBarUI.style.display = "none";
        this.scoreUI.style.display = "none";
        this.shootUI && (this.shootUI.style.display = "none");
        const score = this.spaceShooter.score;
        this.createGameOverUI(score);
        this.showAudioIcon();
        RE.Input.mouse.unlock();
      }
      this.healthBarIndicator.style.width = healthPct + "%";
      this.hp.textContent = "HP: " + healthPct + "%";
    }

    const curScore = this.spaceShooter.score;
    if (this.score != curScore) {
      this.score = curScore;
      this.scoreUI.textContent = "Score: " + this.score;
    }
  }

  private toggleSound() {
    const audioContext: AudioContext = AudioContext["getContext"]();
    if (audioContext.state === "running") {
      if (!this.spaceShooter.gameStarted || this.useTouch) {
        this.muteIcon.style.display = "block";
        this.audioIcon.style.display = "none";
      }

      audioContext.suspend();
    } else {
      if (!this.spaceShooter.gameStarted || this.useTouch) {
        this.muteIcon.style.display = "none";
        this.audioIcon.style.display = "block";
      }

      audioContext.resume();
    }
  }

  private openFullscreen() {
    if (RE.isDev()) return;

    const elem = document.getElementById("rogue-app");

    if (!elem) return;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem["mozRequestFullScreen"]) { /* Firefox */
      elem["mozRequestFullScreen"]();
    } else if (elem["webkitRequestFullscreen"]) { /* Chrome, Safari & Opera */
      elem["webkitRequestFullscreen"]();
    } else if (elem["msRequestFullscreen"]) { /* IE/Edge */
      elem["msRequestFullscreen"]();
    }
  }

  private createAudioNotice() {
    const audioNotice = document.createElement("div");
    audioNotice.textContent = "Hit 'M' to toggle audio";
    audioNotice.style.position = "absolute";
    audioNotice.style.bottom = "0";
    audioNotice.style.right = "0";
    audioNotice.style.margin = "10px";
    audioNotice.style.fontSize = "14px";
    audioNotice.style.color = "white";
    audioNotice.style.display = "none";

    this.uiContainer.appendChild(audioNotice);
    this.audioNotice = audioNotice;
  }

  private createSoundControls() {
    this.audioIcon = document.createElement("img");
    this.muteIcon = document.createElement("img");

    this.audioIcon.src = RE.getStaticPath("Icons/sound-on.svg");
    this.setSoundControlStyles(this.audioIcon);

    this.muteIcon.src = RE.getStaticPath("Icons/mute.svg");
    this.setSoundControlStyles(this.muteIcon);

    this.audioIcon.onclick = this.audioIcon.ontouchend = () => {
      this.toggleSound();
    }

    this.muteIcon.onclick = this.muteIcon.ontouchend = () => {
      this.toggleSound();
    }

    this.audioIcon.ontouchstart = this.muteIcon.ontouchstart = e => {
      e.preventDefault();
      e.stopPropagation();
    }

    this.showAudioIcon();

    this.uiContainer.appendChild(this.audioIcon);
    this.uiContainer.appendChild(this.muteIcon);
  }

  private showAudioIcon() {
    const audioContext: AudioContext = AudioContext["getContext"]();

    if (audioContext.state === "running") {
      this.muteIcon.style.display = "none";
      this.audioIcon.style.display = "block";
    } else {
      this.muteIcon.style.display = "block";
      this.audioIcon.style.display = "none";
    }
  }

  private setSoundControlStyles(icon: HTMLImageElement) {
    icon.style.position = "absolute";
    icon.style.top = "20px";
    icon.style.right = "20px";
    icon.style.height = "30px";
  }

  private createLoadingUI() {
    if (this.loadingUI) {
      if (this.loadingUI.style.display === "none")
        this.loadingUI.style.display = "";

      return this.loadingUI
    }

    this.loadingUI = document.createElement("div");
    this.loadingUI.style.margin = "auto";
    this.loadingUI.style.textAlign = "center";
    this.loadingUI.style.cursor = "pointer";
    this.loadingUI.style.color = "white";
    this.loadingUI.style.position = "relative";
    this.loadingUI.style.width = "fit-content";
    this.loadingUI.style.top = "50%";
    this.loadingUI.style.fontSize = "20px";
    this.loadingUI.textContent = "Loading...";

    this.uiContainer.appendChild(this.loadingUI);

    return this.loadingUI;
  }

  private createStartGameUI() {
    if (this.startGameUI) {
      if (this.startGameUI.style.display === "none")
        this.startGameUI.style.display = "flex";

      return this.startGameUI
    }

    this.startGameUI = document.createElement("div");
    this.startGameUI.style.margin = "auto";
    this.startGameUI.style.textAlign = "center";
    this.startGameUI.style.height = "100%";
    this.startGameUI.style.display = "flex";
    this.startGameUI.style.flexDirection = "column";
    this.startGameUI.style.justifyContent = "center";

    const gameTitle = document.createElement("h1");
    gameTitle.textContent = "Rogue Space Shooter";
    gameTitle.style.color = "crimson";

    const playBtn = document.createElement("h2");
    playBtn.style.cursor = "pointer";
    playBtn.style.color = "white";
    playBtn.style.position = "relative";
    playBtn.textContent = "Play!";

    playBtn.ontouchend = () => {
      this.startGameUI.style.display = "none";
      this.useTouch = true;
      RE.Input.mouse.enabled = false;
      this.openFullscreen();
      this.startGame();
    };

    playBtn.onclick = () => {
      this.startGameUI.style.display = "none";
      this.audioNotice.style.display = "block";
      this.startGame();
    };

    this.startGameUI.appendChild(gameTitle);
    this.startGameUI.appendChild(playBtn);

    this.uiContainer.appendChild(this.startGameUI);

    return this.startGameUI;
  }

  private createScoreUI() {
    if (this.scoreUI) {
      this.scoreUI.textContent = "Score: 0";

      if (this.scoreUI.style.display === "none")
        this.scoreUI.style.display = "";

      return this.scoreUI
    }

    this.scoreUI = document.createElement("div");
    this.scoreUI.textContent = "Score: 0";
    this.scoreUI.style.float = "left";
    this.scoreUI.style.textAlign = "center";
    this.scoreUI.style.margin = "10px";
    this.scoreUI.style.lineHeight = "30px";
    this.scoreUI.style.color = "white";

    this.uiContainer.appendChild(this.scoreUI);

    return this.scoreUI;
  }

  private createShootUI() {
    if (this.shootUI) {
      if (this.shootUI.style.display === "none")
        this.shootUI.style.display = "";

      return this.shootUI
    }

    this.shootUI = document.createElement("img");

    this.shootUI.src = RE.getStaticPath("Icons/crosshair.svg");
    this.shootUI.style.position = "absolute";
    this.shootUI.style.padding = "10px";
    this.shootUI.style.height = "70px";
    this.shootUI.style.color = "white";
    this.shootUI.style.right = "10%";
    this.shootUI.style.bottom = "30%";

    this.shootUI.ontouchstart = evt => {
      evt.preventDefault();
      RE.Input.touch.touches.length === 0 && evt.stopPropagation();

      const shooter = RE.getComponent(Shooter, this.spaceShooter.playerStatus.object3d);
      shooter && shooter.shoot();
    };

    this.uiContainer.appendChild(this.shootUI);

    return this.shootUI;
  }

  private createHealthBarUI() {
    if (this.healthBarUI) {
      if (this.healthBarUI.style.display === "none")
        this.healthBarUI.style.display = "";

      return this.healthBarUI;
    }

    this.healthBarUI = document.createElement("div");
    this.healthBarUI.style.position = "relative";
    this.healthBarUI.style.width = "200px";
    this.healthBarUI.style.height = "30px";
    this.healthBarUI.style.margin = "10px";
    this.healthBarUI.style.outline = "#3333aabb solid 2px";
    this.healthBarUI.style.float = "right";

    this.healthBarIndicator = document.createElement("div");
    this.healthBarIndicator.style.background = "#4444bbbb";
    this.healthBarIndicator.style.width = "20%";
    this.healthBarIndicator.style.height = "100%";
    this.healthBarIndicator.style.position = "absolute";
    this.healthBarIndicator.style.direction = "rtl";
    this.healthBarIndicator.style.right = "0";

    this.hp = document.createElement("div");
    this.hp.textContent = "HP: 100%";
    this.hp.style.position = "absolute";
    this.hp.style.margin = "auto";
    this.hp.style.width = "100%";
    this.hp.style.textAlign = "center";
    this.hp.style.lineHeight = "30px";
    this.hp.style.color = "white";

    this.healthBarUI.appendChild(this.healthBarIndicator);
    this.healthBarUI.appendChild(this.hp);

    this.uiContainer.appendChild(this.healthBarUI);

    return this.healthBarUI;
  }

  private createGameOverUI(score: number) {
    if (this.gameOverUI) {
      this.finalScoreUI.textContent = "Score: " + score;

      if (this.gameOverUI.style.display === "none")
        this.gameOverUI.style.display = "flex";

      return this.gameOverUI;
    }

    this.audioIcon.style.top = "20px";
    this.muteIcon.style.top = "20px";

    this.gameOverUI = document.createElement("div");
    this.gameOverUI.style.margin = "auto";
    this.gameOverUI.style.lineHeight = "50%";
    this.gameOverUI.style.textAlign = "center";
    this.gameOverUI.style.height = "100%";
    this.gameOverUI.style.display = "flex";
    this.gameOverUI.style.flexDirection = "column";
    this.gameOverUI.style.justifyContent = "center";

    const gameOverTitle = document.createElement("h1");
    gameOverTitle.textContent = "Game Over";
    gameOverTitle.style.color = "crimson";

    this.finalScoreUI = document.createElement("h3");
    this.finalScoreUI.textContent = "Score: " + score;
    this.finalScoreUI.style.color = "White";

    const retryBtn = document.createElement("h2");
    retryBtn.style.cursor = "pointer";
    retryBtn.style.color = "white";
    retryBtn.style.position = "relative";
    retryBtn.textContent = "Retry!";

    retryBtn.ontouchend = retryBtn.onclick = ()=> {
      this.gameOverUI.style.display = "none";
      this.startGame();
    };

    this.gameOverUI.appendChild(gameOverTitle);
    this.gameOverUI.appendChild(this.finalScoreUI);
    this.gameOverUI.appendChild(retryBtn);

    this.uiContainer.appendChild(this.gameOverUI);

    return this.gameOverUI;
  }

  private startGame() {
    this.score = 0;
    this.playerHealth = 0;

    this.spaceShooter.startGame();

    this.createScoreUI();
    this.createHealthBarUI();

    if (this.useTouch) {
      this.createShootUI();
      this.audioIcon.style.top = "60px";
      this.muteIcon.style.top = "60px";
      return;
    }

    this.audioIcon.style.display = "none";
    this.muteIcon.style.display = "none";

    RE.Input.mouse.lock();
  }
}

RE.registerComponent(GameUI);
