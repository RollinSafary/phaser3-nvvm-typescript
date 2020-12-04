import BasePopup from '../base/popup/BasePopup';
import PopupScene from '../scenes/PopupScene';
import { getScene, postRunnable } from './phaser/PhaserUtils';

export default class PopupManager {
  public currentPopup: BasePopup;
  private static instance: PopupManager;
  public queue: IQueue<BasePopup>[] = [];

  public static getInstance(): PopupManager {
    return this.instance || (this.instance = new this());
  }

  public addToQueue<T extends BasePopup>(
    popup: T,
    x: number,
    y: number,
    ...args: any[]
  ): void {
    this.queue.push({
      popup,
      x,
      y,
      args,
    });
  }

  public removeFromQueue<T extends BasePopup>(popup: T, ...args: any[]): void {
    const target: any = this.queue.filter((queueData: IQueue<T>) => {
      return (
        queueData.popup === popup && (args ? queueData.args === args : true)
      );
    })[0];
    this.queue.remove(target);
  }

  public show<T extends BasePopup>(
    popup: T,
    x: number,
    y: number,
    ...args: any[]
  ): void {
    this.queue.push({
      popup,
      x,
      y,
      args,
    });
    this.queue.length === 1 && this.internalShow();
  }

  public async hide(actionId?: number): Promise<void> {
    await this.currentPopup.hide(actionId);
    postRunnable(this.showNextPopup, this);
  }

  public showNextPopup(): void {
    !!this.currentPopup &&
      this.currentPopup.active &&
      this.currentPopup.destroy();
    this.queue.shift();
    this.currentPopup = null;
    this.hasQueue ? this.internalShow() : getScene(PopupScene.NAME).sys.sleep();
  }

  private internalShow(): void {
    const popupData: IQueue<BasePopup> = this.queue[0];
    popupData.popup.prepareToShow(popupData.x, popupData.y, ...popupData.args);
    this.currentPopup = popupData.popup;
    this.scene.sys.isSleeping() && this.scene.sys.wake();
    this.currentPopup.show(popupData.x, popupData.y, ...popupData.args);
  }

  get hasQueue(): boolean {
    return !!this.queue.length;
  }

  get scene(): PopupScene {
    return getScene(PopupScene.NAME);
  }
}

interface IQueue<T extends BasePopup> {
  popup: T;
  x: number;
  y: number;
  args: any[];
}
