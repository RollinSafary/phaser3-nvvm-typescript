import GameFacade from '../../GameFacade';
import BaseScene from '../base/scene/BaseScene';
import BootScene from './BootScene';
import ServiceScene from './ServiceScene';

export default class LoadScene extends BaseScene {
  public static NAME: string = 'LoadScene';
  public static LOAD_COMPLETE_NOTIFICATION: string = `LoadComplete`;

  constructor() {
    super(LoadScene.NAME);
  }

  public preload(): void {}

  public create(): void {
    this.sendNotification(
      LoadScene.LOAD_COMPLETE_NOTIFICATION,
      this.constructor.name,
    );
    this.sceneManager.stop(this.constructor.name);
    this.sceneManager.remove(this.constructor.name);
  }

  public registerNotificationInterests(): void {
    this.subscribeToNotifications(BootScene.BOOT_COMPLETE_NOTIFICATION);
  }

  public handleNotification(notificationName: string, ...args: any[]): void {
    switch (notificationName) {
      case BootScene.BOOT_COMPLETE_NOTIFICATION:
        this.start();
        break;
      default:
        this.onUnhandledNotification(notificationName);
        break;
    }
  }
}
