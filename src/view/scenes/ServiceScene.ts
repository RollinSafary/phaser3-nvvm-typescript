import { Images } from '../../assets';
import { gameConfig } from '../../constants/GameConfig';
import GameFacade from '../../GameFacade';
import BaseScene from '../base/scene/BaseScene';

export default class ServiceScene extends BaseScene {
  public static NAME: string = 'ServiceScene';
  public static GAME_RESUMED_NOTIFICATION: string = `${ServiceScene.NAME}GameResumed`;
  public static GAME_PAUSED_NOTIFICATION: string = `${ServiceScene.NAME}GamePaused`;

  public fadeOutPromise: Promise<void>;
  public fadeInPromise: Promise<void>;
  private fadeImage: Phaser.GameObjects.Image;

  constructor() {
    super(ServiceScene.NAME);
  }

  public preload(): void {}

  public create(): void {
    this.createFadeImage();
  }

  public updateLanguage(lang: string): void {
    this.i18n.changeLanguage(lang);
  }

  public async screenFadeOut(
    color: number,
    duration: number,
    delay?: number,
  ): Promise<void> {
    return (this.fadeOutPromise = new Promise<void>(
      (resolve: (value?: void | PromiseLike<void>) => void) => {
        this.scene.bringToTop(ServiceScene.NAME);
        this.fadeImage.setTint(color);
        this.fadeImage.alpha = 0;
        const tweens: Phaser.Tweens.Tween[] = this.tweens.getTweensOf(
          this.fadeImage,
        );
        for (const tween of tweens) {
          tween.emit(Phaser.Tweens.Events.TWEEN_COMPLETE);
        }
        this.tweens.killTweensOf(this.fadeImage);
        this.tweens.add({
          targets: this.fadeImage,
          alpha: 1,
          duration,
          delay,
          onComplete: () => {
            this.scene.sendToBack(ServiceScene.NAME);
            resolve();
          },
        });
      },
    ));
  }

  public async screenFadeIn(duration: number, delay?: number): Promise<void> {
    return (this.fadeInPromise = new Promise<void>(
      (resolve: (value?: void | PromiseLike<void>) => void) => {
        if (this.fadeImage.alpha !== 1) {
          resolve();
          return;
        }
        this.scene.bringToTop(ServiceScene.NAME);
        const tweens: Phaser.Tweens.Tween[] = this.tweens.getTweensOf(
          this.fadeImage,
        );
        for (const tween of tweens) {
          tween.emit(Phaser.Tweens.Events.TWEEN_COMPLETE);
        }
        this.tweens.killTweensOf(this.fadeImage);
        this.tweens.add({
          targets: this.fadeImage,
          alpha: 0,
          duration,
          delay,
          onComplete: () => {
            resolve();
          },
        });
      },
    ));
  }

  public registerNotificationInterests(): void {
    this.subscribeToNotification(GameFacade.STARTUP_NOTIFICATION);
  }

  public handleNotification(notificationName: string, ...args: any[]): void {
    switch (notificationName) {
      case GameFacade.STARTUP_NOTIFICATION:
        this.sceneManager.start(this.constructor.name);
        break;
      default:
        this.onUnhandledNotification(notificationName);
        break;
    }
  }

  protected createFadeImage(): void {
    this.fadeImage = this.add.image(
      gameConfig.canvasWidth / 2,
      gameConfig.canvasHeight / 2,
      Images.WhitePixel.Name,
    );
    this.fadeImage.setScale(
      gameConfig.canvasWidth / this.fadeImage.width,
      gameConfig.canvasHeight / this.fadeImage.height,
    );
    this.fadeImage.setAlpha(0);
  }
}
