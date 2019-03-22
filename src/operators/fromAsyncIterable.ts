import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

/**
 * As soon as a value is ready to be taken from the async iterable, put it immediately into the
 * channel on which this method was called
 * @param ait an asyncIterable
 * @return the channel on which the method was called
*/
function fromAsyncIterable<T>(this: ChannelWrapper<T>, ait: AsyncIterable<T>): ChannelWrapper<T> {
    
    (async () => {
        for await (const msg of ait) {
            this.put(msg);
        }
    })();

    return this;
}

ChannelWrapperImp.prototype.fromAsyncIterable = fromAsyncIterable;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        fromAsyncIterable: typeof fromAsyncIterable;
    }
}