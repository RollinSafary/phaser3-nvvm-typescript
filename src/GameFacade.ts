import { Facade } from '@rollinsafary/mvvm';
import Game from './Game';
import ServiceScene from './view/scenes/ServiceScene';
import BootScene from './view/scenes/BootScene';
import LoadScene from './view/scenes/LoadScene';
import PopupScene from './view/scenes/PopupScene';

const consoleArgs: string[] = [
  ``,
  `background: ${'#c8c8ff'}`,
  `background: ${'#9696ff'}`,
  `color: ${'#ffffff'}; background: ${'#0000ff'};`,
  `background: ${'#9696ff'}`,
  `background: ${'#c8c8ff'}`,
];

export default class GameFacade extends Facade {
  public static STARTUP_NOTIFICATION: string = `StartUp`;

  public static game: Game;

  public static getInstance(): GameFacade {
    if (!Facade.instance) {
      Facade.instance = new GameFacade();
    }
    return Facade.instance as GameFacade;
  }

  public initializeFacade(): void {
    GameFacade.game.events.once(Phaser.Core.Events.READY, this.ready, this);
  }

  public sendNotification(notificationName: string, ...args: any[]): void {
    consoleArgs[0] = `%c %c %c ${notificationName}${
      args.length > 0 ? ' | ' + args : ''
    } %c %c `;
    console.log.apply(console, consoleArgs);
    super.sendNotification(notificationName, ...args);
  }

  protected initializeModel(): void {
    super.initializeModel();
  }

  protected initializeView(): void {
    super.initializeView();
    this.registerView(new ServiceScene());
    this.registerView(new PopupScene());
    this.registerView(new LoadScene());
    this.registerView(new BootScene());
  }

  private startup(): void {
    this.sendNotification(GameFacade.STARTUP_NOTIFICATION);
  }

  private ready(): void {
    super.initializeFacade();
    this.startup();
  }
}
