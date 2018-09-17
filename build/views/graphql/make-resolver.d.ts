import { TypeMapperContext } from "./make-schema";
import { IMeta } from "../../models/meta";
export declare function makeResolver(meta: IMeta, context: TypeMapperContext): (source: any) => Promise<any>;
