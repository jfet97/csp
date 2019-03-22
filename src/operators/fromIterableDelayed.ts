import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

/**
 * Take all the values from the sync iterable and put them into the channel on which this method was called,
 * waiting that a value is taken from the channel before putting the next one.
 * @param it an iterable
 * @return the channel on which the method was called
*/
function fromIterableDelayed<T>(this: ChannelWrapper<T>, it: Iterable<T>): ChannelWrapper<T> {

    (async () => {
        for (const msg of it) {
            await this.put(msg);
        }
    })()

    return this;
}

ChannelWrapperImp.prototype.fromIterableDelayed = fromIterableDelayed;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        fromIterableDelayed: typeof fromIterableDelayed;
    }
}