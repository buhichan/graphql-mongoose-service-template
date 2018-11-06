import { TypeMapperContext } from "./make-schema";
import { RefFieldMeta } from "../../models/meta";
export declare function makeRefResolver(meta: RefFieldMeta, context: TypeMapperContext): (source: any) => Promise<any>;
