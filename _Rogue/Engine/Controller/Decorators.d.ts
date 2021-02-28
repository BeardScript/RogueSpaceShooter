declare type propType = 'String' | 'Number' | 'Boolean' | 'Select' | 'Vector2' | 'Vector3' | 'Object3D' | 'Prefab' | 'Texture' | 'Material' | 'Component' | 'Audio' | 'PositionalAudio';
export declare function Prop(type: propType): (target: Object, propertyKey: string) => void;
export {};
