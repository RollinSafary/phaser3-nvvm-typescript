import {
  I18nCreator,
  I18nFactory,
  I18nScene,
} from '@candywings/phaser3-i18n-plugin';
import {
  INinePatchCreator,
  INinePatchFactory,
} from '@koreez/phaser3-ninepatch';
import { Facade, IView } from '@rollinsafary/mvvm';
import { gameConfig } from '../../../constants/GameConfig';
import Game from '../../../Game';
import GameFacade from '../../../GameFacade';
import {
  IEventRegistrationData,
  IPosition,
  postRunnable,
} from '../../utils/phaser/PhaserUtils';

export default abstract class BaseScene extends I18nScene implements IView {
  // MVVM view properties
  public static START_NOTIFICATION: string = `SceneStarted`;
  public static STOP_NOTIFICATION: string = `SceneStopped`;
  public static DESTROY_NOTIFICATION: string = `SceneDestroyed`;

  public facade: Facade;
  public viewId: number;
  public viewName: string;
  public notificationInterests: string[] = [];
  public isAwake: boolean = true;
  public viewComponentEvents: IEventRegistrationData[] = [];

  // SCENE properties
  public add: INinePatchFactory & I18nFactory;
  public make: INinePatchCreator & I18nCreator;
  public game: Game;
  public spine: any;

  constructor(name: string) {
    super(name);
    this.initializeNotifier();
    (this.constructor as any)[
      'LANGUAGE_CHANGED_EVENT'
    ] = `languageChangedEvent`;
  }

  public async start(): Promise<void> {
    return new Promise<void>(
      (resolve: (value?: void | PromiseLike<void>) => void) => {
        if (this.sceneManager.isActive(this.constructor.name)) {
          return;
        }
        postRunnable(() => {
          this.sceneManager.start(this.constructor.name);
          resolve();
        });
      },
    );
  }
  public async stop(): Promise<void> {
    return new Promise<void>(
      (resolve: (value?: void | PromiseLike<void>) => void) => {
        if (!this.sceneManager.isActive(this.constructor.name)) {
          return;
        }
        postRunnable(() => {
          this.sceneManager.stop(this.constructor.name);
          resolve();
        });
      },
    );
  }

  public sleep(): void {
    this.isAwake = false;
  }
  public wake(): void {
    this.isAwake = true;
  }

  public getViewName(): string {
    return this.viewName;
  }
  public getViewId(): number {
    return this.viewId;
  }

  public subscribeToNotifications(...notificationNames: string[]): void {
    for (const notificationName of notificationNames) {
      this.subscribeToNotification(notificationName);
    }
  }

  public subscribeToNotification(notificationName: string): void {
    !this.notificationInterests.includes(notificationName) &&
      this.notificationInterests.push(notificationName);
  }

  public unSubscribeFromNotifications(...notificationNames: string[]): void {
    for (const notificationName of notificationNames) {
      this.unSubscribeFromNotification(notificationName);
    }
  }

  public unSubscribeFromNotification(notificationName: string): void {
    this.notificationInterests.includes(notificationName) &&
      this.notificationInterests.remove(notificationName);
  }

  public handleSubscribedNotification(
    notificationName: string,
    ...args: any[]
  ): void {
    this.isAwake && this.handleNotification(notificationName, ...args);
  }

  public abstract handleNotification(
    notificationName: string,
    ...args: any[]
  ): void;
  public abstract registerNotificationInterests(): void;

  public onRegister(): void {
    this.sceneManager.add(this.constructor.name, this);
    this.setViewComponentListeners();
  }

  public onRemove(): void {
    this.sceneManager.remove(this.constructor.name);
  }

  public initializeNotifier(): void {
    this.facade = Facade.getInstance();
    this.viewName = this.constructor.name;
  }

  public sendNotification(notificationName: string, ...args: any[]): void {
    this.facade.sendNotification(notificationName, ...args);
  }

  public async slideTo(from?: IPosition, to?: IPosition): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.tweens.killTweensOf(this.cameras.main);
      if (from) {
        this.cameras.main.x = Math.sign(from.x) * gameConfig.canvasWidth;
        this.cameras.main.y = Math.sign(from.y) * gameConfig.canvasHeight;
      }
      this.tweens.add({
        targets: this.cameras.main,
        x: to ? gameConfig.canvasWidth * Math.sign(to.x) : 0,
        y: to ? gameConfig.canvasHeight * Math.sign(to.y) : 0,
        duration: 700,
        ease: Phaser.Math.Easing.Expo.InOut,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  public init(...args: any[]): void {
    this.input.setTopOnly(false);
    this.i18n = this.game.i18n;
  }

  protected setViewComponentListeners(): void {
    this.events.on(Phaser.Scenes.Events.START, this.onStart, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onStop, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
  }

  protected onStart(): void {
    this.sendNotification(BaseScene.START_NOTIFICATION, this.constructor.name);
  }
  protected onStop(): void {
    this.sendNotification(BaseScene.STOP_NOTIFICATION, this.constructor.name);
  }

  protected onDestroy(): void {
    this.removeViewComponentListeners();
    this.sendNotification(
      BaseScene.DESTROY_NOTIFICATION,
      this.constructor.name,
    );
  }

  private removeViewComponentListeners(): void {
    for (const eventRegistrationData of this.viewComponentEvents) {
      this.events.off(
        eventRegistrationData.event,
        eventRegistrationData.handler,
        eventRegistrationData.context,
      );
    }
  }

  public addViewComponentListener(
    event: string,
    handler: (...args: any[]) => any,
    context: any,
  ): void {
    this.viewComponentEvents.push({ event, handler, context });
    this.events.on(event, handler, context);
  }

  public removeViewComponentListener(
    event: string,
    handler: (...args: any[]) => any,
    context: any,
  ): void {
    const targetEventRegistrationData = this.viewComponentEvents.find(
      (eventRegistrationData: IEventRegistrationData) =>
        eventRegistrationData.event === event &&
        eventRegistrationData.handler === handler &&
        eventRegistrationData.context === context,
    );
    if (!targetEventRegistrationData) {
      return;
    }
    this.viewComponentEvents.remove(targetEventRegistrationData);
    this.events.off(event, handler, context);
  }

  protected onUnhandledNotification(notificationName: string): void {
    console.warn(
      `${notificationName} is not handled in ${this.constructor.name}`,
    );
  }

  get width(): number {
    return this.cameras.main.width;
  }
  get height(): number {
    return this.cameras.main.height;
  }

  get sceneManager(): Phaser.Scenes.SceneManager {
    return GameFacade.game.scene;
  }
}
