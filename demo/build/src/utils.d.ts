import { Connection } from "mongoose";
export declare const makeModelGetter: (connection: Connection) => (metaName: string) => import("mongoose").Model<any>;
export declare function pipe(...args: Function[]): any;
export declare function deepGet(obj: any, path: string[]): any;
export declare function defaultValue(defaultV: any): (v: any) => any;
export declare const head: <T>(maybeArr: T | T[]) => T;
export declare function deepEqual(a: any, b: any): any;
