import { Scene, Object3D } from 'three';
import SceneController from '../Model/SceneController';
export declare class App {
    private static _title;
    private static _settings;
    private static _currentScene;
    private static _activeCamera;
    private static _scenes;
    private static _sceneController;
    private constructor();
    static activeCamera: string;
    static readonly settings: any;
    static title: string;
    static currentScene: Scene;
    static readonly scenes: {
        name: string;
        uuid: string;
    }[];
    static sceneController: SceneController;
    static toJSON(assetPaths: {
        [uuid: string]: string;
    }): {
        title: string;
        scenes: {
            name: string;
            uuid: string;
        }[];
        assetPaths: {
            [uuid: string]: string;
        };
    };
    static fromJSON(json: {
        title: string;
        scenes: {
            name: string;
            uuid: string;
        }[];
        assetPaths: {
            [uuid: string]: string;
        };
    }): void;
    static play(config: {
        title: string;
        scenes: {
            name: string;
            uuid: string;
        }[];
        assetPaths: {
            [uuid: string]: string;
        };
    }): void;
    static loadScene(name: string | number): Promise<void>;
    static clone(object: Object3D, parent?: Object3D): Object3D;
    private static loadComponentsRecursive;
    private static loadAudioListeners;
}
