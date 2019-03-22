import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

/**
 *  As soon as a value is ready to be taken from the async iterable put it into the channel on which this method was called,
 * but wait until something is ready to take it before requesting the next one and putting it into the channel
 * @param ait an asyncIiterable
 * @return the channel on which the method was called
*/

function fromAsyncIterableDelayed<T>(this: ChannelWrapper<T>, ait: AsyncIterable<T>): ChannelWrapper<T> {

    (async () => {
        for await (const msg of ait) {
            await this.put(msg);
        }
    })();

    return this;
}

ChannelWrapperImp.prototype.fromAsyncIterableDelayed = fromAsyncIterableDelayed;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        fromAsyncIterableDelayed: typeof fromAsyncIterableDelayed;
    }
}