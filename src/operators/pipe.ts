import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

/** 
 * Supplies to the out channel all the values taken from the channel on which this method was called
 * return the out channel to allow pipe chaining
 * @param outCh the destination channel
 * @returns the destination channel
*/ 
function pipe<T>(this: ChannelWrapper<T>, outCh: ChannelWrapper<T>): ChannelWrapper<T> {

    (async () => {
        for await (const msg of this) {
            await outCh.put(msg);
        }
    })();

    return outCh;
}

ChannelWrapperImp.prototype.pipe = pipe;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        pipe: typeof pipe;
    }
}