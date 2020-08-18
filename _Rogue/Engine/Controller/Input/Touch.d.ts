export declare type TouchInteraction = {
    id: string;
    touch: Touch;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
};
export declare class TouchController {
    private _startTouches;
    private _endTouches;
    private _touches;
    private _enabled;
    readonly startTouches: TouchInteraction[];
    readonly endTouches: TouchInteraction[];
    readonly touches: TouchInteraction[];
    enabled: boolean;
    init(): void;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    private getCurrentTouchIndexById;
    private setTouchValues;
}
