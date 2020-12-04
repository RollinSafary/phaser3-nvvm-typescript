import { Facade, IView } from '@rollinsafary/mvvm';
import { IEventRegistrationData } from '../../utils/phaser/PhaserUtils';

export default abstract class BaseComponent extends Phaser.GameObjects.Container
  implements IView {
  public facade: Facade;
  public viewId: number;
  public viewName: string;
  public notificationInterests: string[];
  public isAwake: boolean;
  public viewComponentEvents: IEventRegistrationData[] = [];

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
    this.setViewComponentListeners();
  }

  public onRemove(): void {
    this.active && this.destroy();
  }

  public initializeNotifier(): void {
    this.facade = Facade.getInstance();
    this.viewName = this.constructor.name;
  }

  public sendNotification(notificationName: string, ...args: any[]): void {
    this.facade.sendNotification(notificationName, ...args);
  }

  public destroy(fromScene?: boolean): void {
    this.removeViewComponentListeners();
    super.destroy(fromScene);
  }

  protected setViewComponentListeners(): void {
    //
  }

  private removeViewComponentListeners(): void {
    for (const eventRegistrationData of this.viewComponentEvents) {
      this.off(
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
    this.on(event, handler, context);
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
    this.off(event, handler, context);
  }
}
