import { Channel } from './Channel';

/**
 * Interface for the Selectable Class.
 * A selectable could be: a plain Object, a Map, a Set and an Array as well of channels.
*/
interface Selectable<T> {
    /** A reference to the selectable object */
    sel: { [k: string]: Channel<T> } | Map<any, Channel<T>> | Set<Channel<T>> | Channel<T>[];
    /** 
     * A method that map each channel contained into the selectable into a Promise containg that channel .
     * @param fn A proper mapper function.
    */
    mapToPromise(fn: (c: Channel<T>) => Promise<Channel<T>>): SelectableP<T>;
    /**
     * Whatever the selectable is, this method convert it into an array of channels.
     * Warning: Map and Object keys will be lost.
     */
    revertToArray(): Channel<T>[];
    // map(fn: (c: Channel<T>) => Channel<T>): Selectable<T>;
    /**
     * A method that execute the filter operation. 
     * @param predicate A proper predicate function .
     */
    filter(predicate: (c: Channel<T>) => boolean): Selectable<T>;
    /**
     * A method that return the key of a specific channel.
     * If the selectable is a Set, the channel itself will be returned.
     * The not found channel status is not contemplated because this method is called only in a safe context.
     * @param searchedCh A channel of which we are looking for the key.
     */
    keyOf(searchedCh: Channel<T>): any;
}

/**
 * Interface for the Selectable PClass.
 * A selectableP could be: a plain Object, a Map, a Set and an Array as well of channels.
 * Differently from the normal selectable, the channel is always wrapped into a Promise.
*/
interface SelectableP<T> {
    /** A reference to the selectableP object*/
    sel: { [k: string]: Promise<Channel<T>> } | Map<any, Promise<Channel<T>>> | Set<Promise<Channel<T>>> | Promise<Channel<T>>[];
    /**
     * Whatever the selectable is, this method convert it into an array of Promise<channel>.
     * Warning: Map and Object keys will be lost.
     */
    revertToArray(): Promise<Channel<T>>[];
}

/**
 * Implementation for the Selectable Class.
 * See the [[Selectable]] interface for more details.
*/
class SelectableImp<T> implements Selectable<T> {

    public constructor(public sel: { [k: string]: Channel<T> } | Map<any, Channel<T>> | Set<Channel<T>> | Channel<T>[]) {
    }

    /* we don't need it yet, but she is ready
    map(fn: (c: Channel<T>) => Channel<T>): Selectable<T> {
        let res;
        if (this.sel instanceof Map) {
            const selEntries = [...this.sel.entries()];
            res = new Map(selEntries.map(([key, ch]): [any, Channel<T>] => [key, fn(ch)]));
        } else if (this.sel instanceof Set) {
            res = new Set([...this.sel.values()].map(ch => fn(ch)));
        } else if (Array.isArray(this.sel)) {
            res = this.sel.map(ch => fn(ch));
        } else {
            // plain js object

            // to erase as soon as typescript supports es2019 features: use Object.fromEntries instead
            const fromEntries = function fromEntries(iterable: any) {
                return [...iterable]
                    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {})
            }
            res = fromEntries(Object.entries(this.sel).map(([key, ch]) => [key, fn(ch)]));
        }
        return new SelectableImp<T>(res);
    }*/

    public mapToPromise(fn: (c: Channel<T>) => Promise<Channel<T>>): SelectableP<T> {
        let res;
        if (this.sel instanceof Map) {
            const selEntries = [...this.sel.entries()];
            res = new Map(selEntries.map(([key, ch]): [any, Promise<Channel<T>>] => [key, fn(ch)]));
        } else if (this.sel instanceof Set) {
            res = new Set([...this.sel.values()].map((ch): Promise<Channel<T>> => fn(ch)));
        } else if (Array.isArray(this.sel)) {
            res = this.sel.map((ch): Promise<Channel<T>> => fn(ch));
        } else {
            // plain js object

            // to erase as soon as typescript supports es2019 features: use Object.fromEntries instead
            const fromEntries = function fromEntries(iterable: any): any {
                return [...iterable]
                    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {})
            }
            res = fromEntries(Object.entries(this.sel).map(([key, ch]): [string, Promise<Channel<T>>] => [key, fn(ch)]));
        }
        return new SelectablePImp<T>(res);
    }

    public filter(predicate: (c: Channel<T>) => boolean): Selectable<T> {
        let res;
        if (this.sel instanceof Set) {
            const values = [...this.sel.values()];
            const filteredValues = values.filter(predicate);
            res = new Set(filteredValues);
        } else if (this.sel instanceof Map) {
            const entries = [...this.sel.entries()];
            const filteredEntries = entries.filter(([, value]) => predicate(value));
            res = new Map(filteredEntries);
        } else if (Array.isArray(this.sel)) {
            const values = [...this.sel.values()];
            const filteredValues = values.filter(predicate);
            res = filteredValues;
        } else {
            // plain js object

            // to erase as soon as typescript supports es2019 features: use Object.fromEntries instead
            const fromEntries = function fromEntries(iterable: any): any {
                return [...iterable]
                    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {})
            }

            res = fromEntries(Object.entries(this.sel).filter(([, value]) => predicate(value)));
        }
        return new SelectableImp<T>(res);
    }

    public revertToArray(): Channel<T>[] {
        let res;
        if ((this.sel instanceof Set) || (this.sel instanceof Map) || (Array.isArray(this.sel))) {
            res = [...this.sel.values()];
        } else {
            // plain js object
            res = Object.values(this.sel);
        }
        return (res as Channel<T>[]);
    }

    public keyOf(searchedCh: Channel<T>): any {
        let res;
        if (this.sel instanceof Map) {
            const selEntries = [...this.sel.entries()];
            const [key] = selEntries.find(([, ch]) => ch === searchedCh);
            res = key;
        } else if (this.sel instanceof Set) {
            res = searchedCh;
        } else if (Array.isArray(this.sel)) {
            res = this.sel.findIndex(ch => ch === searchedCh);
        } else {
            // plain js object
            const selEntries = Object.entries(this.sel);
            const [key] = selEntries.find(([, ch]) => ch === searchedCh);
            res = key;
        }
        return res;
    }
}

/**
 * Implementation for the Selectable Class.
 * See the [[SelectableP]] interface for more details.
*/
class SelectablePImp<T> implements SelectableP<T> {
    public constructor(public sel: { [k: string]: Promise<Channel<T>> } | Map<any, Promise<Channel<T>>> | Set<Promise<Channel<T>>> | Promise<Channel<T>>[]) { }

    public revertToArray(): Promise<Channel<T>>[] {
        let res;
        if ((this.sel instanceof Set) || (this.sel instanceof Map) || (Array.isArray(this.sel))) {
            res = [...this.sel.values()];
        } else {
            // plain js object
            res = Object.values(this.sel);
        }
        return (res as Promise<Channel<T>>[]);
    }
}

export { Selectable, SelectableImp };