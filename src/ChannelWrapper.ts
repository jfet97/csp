import { Channel, ChannelImp } from './Channel';
import { alts, select } from './ChannelsUtilities';
import { SelectableImp } from './Selectable';

/** 
 * This interface describe a class that
 * will wrap a channel to simplify and reduce the allowed operation
 * Library's users will use ChannelWrappers instead of Channels
*/
interface ChannelWrapper<T> {
    /**
     * Return the inner contained Channel
     */
    getInnerChannel(): Channel<T>;
    put(msg: T): Promise<void>;
    take(): Promise<T>;
    drain(): Promise<T[]>;
    [Symbol.asyncIterator]: (() => AsyncIterableIterator<T>);
}

// exported class
class ChannelWrapperImp<T> implements ChannelWrapper<T>{
    /**
     * A reference to the real Channel that is wrapped
     */
    private __ch__: Channel<T>;

    public getInnerChannel(): Channel<T> {
        return this.__ch__;
    }

    public constructor(ch: ChannelImp<T> = new ChannelImp<T>()) {
        this.__ch__ = ch;
    }

    public put(msg: T): Promise<void> {
        return this.__ch__.put(msg);
    }

    public take(): Promise<T> {
        return this.__ch__.take();
    }

    public drain(): Promise<T[]> {
        return this.__ch__.drain();
    }

    /**
     * Dear, old generators delegation :)
     */
    public async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
        yield* this.__ch__;
    }

    /**
     * The alts static method will race taking values from multiple channels.
     * It will perform a conversion between ChannelWrapper and the Channels needed by the alts async function
     */
    public static alts<S>(...chs: ChannelWrapper<S>[]): Promise<S> {
        const channels = chs.map(ch => ch.getInnerChannel());
        return alts<S>(...channels);
    }

    /**
     * The select static method will race taking values from multiple channels, similar to alts, but will also return the key of the channel that was selected.
     * It will perform a conversion between ChannelWrapper and the Channels needed by [[select]]
     */
    public static async select<S>(sel: { [k: string]: ChannelWrapper<S> } | Map<any, ChannelWrapper<S>> | Set<ChannelWrapper<S>> | ChannelWrapper<S>[]): Promise<[any, S]> {
        // convert ChannelWrapper<S> into Channel<S>
        // because Selectable works only with the latterone
        let res;

        if (sel instanceof Map) {
            const selEntries = [...sel.entries()];
            res = new Map(selEntries.map(([key, ch]): [any, Channel<S>] => [key, ch.getInnerChannel()]));
        } else if (sel instanceof Set) {
            res = new Set([...sel.values()].map((ch): Channel<S> => ch.getInnerChannel()));
        } else if (Array.isArray(sel)) {
            res = sel.map((ch): Channel<S> => ch.getInnerChannel());
        } else {
            // plain js object

            // to erase as soon as typescript supports es2019 features: use Object.fromEntries instead
            const fromEntries = function fromEntries(iterable: any): any {
                return [...iterable]
                    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {})
            }
            res = fromEntries(Object.entries(sel).map(([key, ch]): [string, Channel<S>] => [key, ch.getInnerChannel()]));
        }

        let selectRes = await select<S>(new SelectableImp<S>(res));
        if (sel instanceof Set) {
            // selectRes = [keyOfWinnerChannel, msg]
            // the key of the winner channel contained in a Set have to be the channel itself but
            // selectRes[0] contains an instance of Channel. We need the initial instance of ChannelWrapper
            // that wraps the winner instance of Channel
            selectRes[0] = [...sel.values()].find((value) => value.getInnerChannel() === selectRes[0])
        }
        return selectRes;
    }

    /**
     * The merge static method will merge together multiple channels, returning a new one that will
     * receive each value inserted into one of its input channels. As soon as a value is available
     * from one of the input channels, it will be putted into the resulting channel.
     * @returns A fresh new channel that will receive all the values inserted into input channels
     */
    public static merge<S>(...chs: ChannelWrapper<S>[]): ChannelWrapper<S> {

        const outCh = new ChannelWrapperImp<S>();

        const mergeProcessFactory = async (source: ChannelWrapper<S>): Promise<void> => {
            // as soon as a value is available from one of the input channels, put it immediately into the output channel
            for await (const msg of source) {
                outCh.put(msg);
            }
        }

        for (const ch of chs) {
            mergeProcessFactory(ch);
        }

        return outCh;
    }

    /**
     * The mergeDelayed static method will merge together multiple channels, returning a new one that will
     * receive each value inserted into one of its input channels. Before taking the next value from one of the input channels,
     * a corresponding take operation will be waited (implicitly contained into the drain method).
     * @returns A fresh new channel that will receive all the values inserted into input channels
     */
    public static mergeDelayed<S>(...chs: ChannelWrapper<S>[]): ChannelWrapper<S> {

        const outCh = new ChannelWrapperImp<S>();

        const mergeProcessFactory = async (source: ChannelWrapper<S>): Promise<void> => {
            // before request the next value from one of the input channels, each process will wait the take operation
            // that will be (eventually) performed on the just inserted message
            for await (const msg of source) {
                await outCh.put(msg);
            }
        }

        for (const ch of chs) {
            mergeProcessFactory(ch);
        }

        return outCh;
    }
}

export {
    ChannelWrapperImp,
    ChannelWrapper
};