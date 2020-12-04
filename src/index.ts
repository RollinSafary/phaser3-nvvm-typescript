import 'phaser';
import Game from './Game';
import {
  disableConsoleFunctions,
  disableInspectElement,
  getMode,
} from './utils/Utils';
import './view/base/component/BaseComponent';
import './view/base/scene/BaseScene';
import './view/utils/phaser/PhaserUtils';

if (getMode() === 'production') {
  disableConsoleFunctions();
  disableInspectElement();
}

document.title = Game.NAME;

document.addEventListener('DOMContentLoaded', startGame, false);

function startGame() {
  new Game();
}
