import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

/**
 * Take all the values from a sync iterable and put them immediately into the
 * channel on which this method was called
 * @param it an iterable
 * @return the channel on which the method was called
*/ 
function fromIterable<T>(this: ChannelWrapper<T>, it: Iterable<T>): ChannelWrapper<T> {
    
    for(const msg of it) {
        this.put(msg);
    }

    return this;
}

ChannelWrapperImp.prototype.fromIterable = fromIterable;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        fromIterable: typeof fromIterable;
    }
}