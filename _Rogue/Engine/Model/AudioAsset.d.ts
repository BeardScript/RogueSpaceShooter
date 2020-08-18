import { Audio, PositionalAudio } from "three";
export declare class AudioAsset {
    private _uuid;
    private _buffer;
    userData: {
        __ASSET__: string;
    };
    constructor(params: {
        uuid: string;
        buffer?: AudioBuffer;
    });
    readonly uuid: string;
    readonly path: string;
    readonly name: string;
    getAudio(): Audio<GainNode>;
    getPositionalAudio(): PositionalAudio;
    static fromFile(filePath: string): Promise<AudioAsset>;
}
