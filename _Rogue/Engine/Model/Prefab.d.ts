import { Object3D } from 'three';
export declare class Prefab {
    private _uuid;
    constructor(uuid: any);
    readonly uuid: string;
    readonly path: string;
    readonly name: string;
    instantiate(parent?: Object3D): Object3D;
}
