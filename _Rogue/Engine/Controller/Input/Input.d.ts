import { Mouse } from './Mouse';
import { Keyboard } from './Keyboard';
import { TouchController } from './Touch';
export declare abstract class Input {
    private static _mouse;
    private static _keyboard;
    private static _touch;
    static readonly mouse: Mouse;
    static readonly keyboard: Keyboard;
    static readonly touch: TouchController;
}
