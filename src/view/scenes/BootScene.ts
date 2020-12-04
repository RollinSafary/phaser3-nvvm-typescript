import GameFacade from '../../GameFacade';
import BaseScene from '../base/scene/BaseScene';
import ServiceScene from './ServiceScene';

export default class BootScene extends BaseScene {
  public static NAME: string = 'BootScene';
  public static BOOT_COMPLETE_NOTIFICATION: string = `BootComplete`;
  public static PLUGIN_READY_NOTIFICATION: string = `PluginReady`;

  constructor() {
    super(BootScene.NAME);
  }

  public create(): void {
    this.sendNotification(BootScene.PLUGIN_READY_NOTIFICATION, 'nine-slice');
    this.i18n.init('en');
    this.sendNotification(BootScene.PLUGIN_READY_NOTIFICATION, 'i18n');
    this.sendNotification(
      BootScene.BOOT_COMPLETE_NOTIFICATION,
      this.constructor.name,
    );
    this.stop();
    this.sceneManager.remove(this.constructor.name);
  }
  public registerNotificationInterests(): void {
    this.subscribeToNotifications(BaseScene.START_NOTIFICATION);
  }

  public handleNotification(notificationName: string, ...args: any[]): void {
    switch (notificationName) {
      case BaseScene.START_NOTIFICATION:
        const sceneName: string = args[0];
        if (sceneName !== ServiceScene.NAME) {
          break;
        }
        this.start();
        break;
      default:
        this.onUnhandledNotification(notificationName);
        break;
    }
  }
}
