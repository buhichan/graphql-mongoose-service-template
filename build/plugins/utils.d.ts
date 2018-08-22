import { Connection } from "mongoose";
export declare const makeModelGetter: (connection: Connection) => (metaName: string) => import("mongoose").Model<any>;
