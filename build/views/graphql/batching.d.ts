export declare function makeBatch<A = any, B = any>(batcher: (R: A[]) => Promise<B[]>): (a: A) => Promise<B>;
