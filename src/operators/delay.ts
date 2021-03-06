import { ChannelWrapper, ChannelWrapperImp } from '../ChannelWrapper';

const timeout = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The delay method creates a new channel that will receive all the values coming from its source,
 * but with a delay expressed in milliseconds.
 * @param ms amount of ms of delay
 * @returns a fresh new channel that will receive all the value inserted into the channel on which this method was called,
 * but delayed by a specific amount of time
 */
function delay<T>(this: ChannelWrapper<T>, ms: number): ChannelWrapper<T> {
    const outCh = new ChannelWrapperImp<T>();

    // start the async process that will delay messages coming from the input channel (this)
    // sending them to the output channel
    (async () => {
        for await (const msg of this) {
            await timeout(ms);

            // wait for something ready to take the message before asking the next one
            // to the input channel (this)
            await outCh.put(msg);
        }
    })();

    return outCh;
}

ChannelWrapperImp.prototype.delay = delay;

declare module '../ChannelWrapper' {
    interface ChannelWrapperImp<T> {
        delay: typeof delay;
    }
}