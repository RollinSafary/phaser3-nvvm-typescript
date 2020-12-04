import BaseScene from '../base/scene/BaseScene';
import PopupManager from '../utils/PopupManager';
import BootScene from './BootScene';
import LoadScene from './LoadScene';

export default class PopupScene extends BaseScene {
  public static NAME: string = 'PopupScene';
  public static REGISTERED_NOTIFICATION: string = `${PopupScene.NAME}Registered`;
  public static WAKE_NOTIFICATION: string = `${PopupScene.NAME}Wake`;
  public static SLEEP_NOTIFICATION: string = `${PopupScene.NAME}Sleep`;

  protected popupManager: PopupManager;

  constructor() {
    super(PopupScene.NAME);
  }

  public create(): void {
    this.input.setTopOnly(true);
  }

  public onRegister(): void {
    super.onRegister();
    this.popupManager = PopupManager.getInstance();
    this.unSubscribeFromNotifications(
      PopupScene.WAKE_NOTIFICATION,
      PopupScene.SLEEP_NOTIFICATION,
    );
  }

  public registerNotificationInterests(): void {
    this.subscribeToNotification(LoadScene.LOAD_COMPLETE_NOTIFICATION);
  }

  public async handleNotification(
    notificationName: string,
    ...args: any[]
  ): Promise<void> {
    switch (notificationName) {
      case LoadScene.LOAD_COMPLETE_NOTIFICATION:
        await this.start();
        this.scene.sleep();
        break;
      default:
        this.onUnhandledNotification(notificationName);
        break;
    }
  }

  public setViewComponentListeners(): void {
    super.setViewComponentListeners();
    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);
    this.events.on(Phaser.Scenes.Events.SLEEP, this.onSleep, this);
  }

  protected onWake(): void {
    this.scene.bringToTop(PopupScene.NAME);
  }

  protected onSleep(): void {
    this.scene.sendToBack(PopupScene.NAME);
  }

  protected registerGamePopups(): void {
    //
  }
}
