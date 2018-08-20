import {Map} from "immutable"

type ValueIn<T> = T extends TypedMap<infer U>? U:T;

export interface TypedMap<T> extends Map<string,any>{
    get<K extends keyof T>(k: K): T[K]
    set<K extends keyof T>(k: K, v: T[K]): this,
    setIn<K1 extends keyof T, K2 extends keyof ValueIn<T[K1]>, K3 extends keyof ValueIn<ValueIn<T[K1]>[K2]>>(keys:[K1,K2,K3],value:any):this
    setIn<K1 extends keyof T, K2 extends keyof ValueIn<T[K1]>>(keys:[K1,K2],value:any):this
    getIn<K1 extends keyof T, K2 extends keyof ValueIn<T[K1]>, K3 extends keyof ValueIn<ValueIn<T[K1]>[K2]>>(keys:[K1,K2,K3]):ValueIn<ValueIn<T[K1]>[K2]>
    getIn<K1 extends keyof T, K2 extends keyof ValueIn<T[K1]>>(keys:[K1,K2]):ValueIn<T[K1]>[K2]
    toJS(): {
        [K in keyof T]:ValueIn<T[K]>
    }
    toObject(): T
    update(updater: (oldValue:this)=>this): TypedMap<T>
    update<K extends keyof T>(k:K, notSetValue:T[K], updater: (oldValue:T[K])=>T[K]): this
    update<K extends keyof T>(k: K, updater: (oldValue:T[K])=>T[K]): this
}

export function TypedMap<T=any>(obj:T){
    return Map(obj) as TypedMap<typeof obj>
}