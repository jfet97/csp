const messages = Symbol('messages');
const putters = Symbol('putters');
const takers = Symbol('takers');
const racers = Symbol('racers');

/**
 * This interface represent a channel.
 * It has 4 FIFO stacks plus some methods to operate with those sstacks.
 */
interface Channel<T> {
    /**
     * This stack will contain all the messages sended by the channel's users
     */
    [messages]: T[];
    /**
     * This stack will contain all the 'resolve' functions of the putters.
     * When a process put a value into the channel a Promise is returned.
     * The 'resolve' function of that Promise ends here
     */
    [putters]: (() => void)[];
    /**
     * This stack will contain all the 'resolve' functions of the takers.
     * When a process take a value from the channel a Promise is returned.
     * The 'resolve' function of that Promise ends here
     */
    [takers]: ((msg: T) => void)[];
    /**
     * This stack will contain all the 'resolve' functions of the racers.
     * When a process execute Channel.alts or Channel.select a Promise is returned.
     * The 'resolve' function of that Promise ends here
     */
    [racers]: ((ch: Channel<T>) => void)[];
    /**
     * This method allow us to use a channel as an async Iterable
     */
    [Symbol.asyncIterator]: (() => AsyncIterableIterator<T>);
    /**
     * 
     * If there is already a taker or a racer waiting a message, the returned promise will be immediately resolved
     * 
     * If both a taker and a racer were waiting a message the priority is given to the taker that will retrieve
     * the message
     * 
     * @param msg A value that will be forwarded into the channel
     * @returns A promise that will be fulfilled when someone takes the msg from the channel
     */
    put(msg: T): Promise<void>;
    /**
    *
    * If there is already a message ready to be taken, the returned promise will be immediately resolved and the message read
    * 
    * @returns A promise that will be fulfilled when someone put a message into the channel
    */
    take(): Promise<T>;
    /**
     * If there are no messages to be taken, the returned array will be empty
     *
     * @returns A promise that will be fulfilled with an array containing all the messages present into a channel 
     */
    drain(): Promise<T[]>;
    /**
     * Transform a Channel into a Promise that wraps the channel itself. The promise will be fulfilled
     * immediately if here is already a message ready to be taken. Otherwise the promise will be fulfilled with the channel
     * when a process do a put operation, but only if there was no a waiting taker
     * 
     * @returns A promise wrapping a Channel
     */
    race(): Promise<Channel<T>>;
    prependMessage(msg: T): void;
    waitATakerOrARacer(resolve: () => void): void;
    isThereAlreadyAPendingTaker(): boolean;
    unwaitOldestPutter(): void;
    retrieveOldestMessage(): T;
    retrieveOldestTaker(): ((msg: T) => void);
    waitAPutter(resolve: (msg: T) => void): void;
    isThereAlreadyAPendingPutter(): boolean;
    waitTheChannel(resolve: (ch: Channel<T>) => void): void;
    retrieveOldestRacer(): ((ch: Channel<T>) => void);
    isThereAPendingRacer(): boolean;
    areThereMessages(): boolean;
    fulfillTheRacer(racer: (ch: Channel<T>) => void): void;
}

/** 
 *  See the [[Channel]] interface for more details.
 */
class ChannelImp<T> implements Channel<T> {



    public [messages]: T[];
    public [putters]: (() => void)[];
    public [takers]: ((msg: T) => void)[];
    public [racers]: ((ch: Channel<T>) => void)[];

    public constructor() {
        this[messages] = [];
        this[putters] = [];
        this[takers] = [];
        this[racers] = [];
    }

    public async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
        while (true) {
            yield await this.take();
        }
    }

    public put(msg: T): Promise<void> {
        return new Promise(resolve => {
            this.prependMessage(msg);
            this.waitATakerOrARacer(resolve);
            if (this.isThereAlreadyAPendingTaker()) {
                this.unwaitOldestPutter();
                const msg = this.retrieveOldestMessage();
                const taker = this.retrieveOldestTaker();
                forwardMessage(taker, msg);
            } else if (this.isThereAPendingRacer()) {
                const racer = this.retrieveOldestRacer();
                this.fulfillTheRacer(racer);
            }
        });
    }

    public take(): Promise<T> {
        return new Promise(resolve => {
            this.waitAPutter(resolve);

            if (this.isThereAlreadyAPendingPutter()) {
                this.unwaitOldestPutter();
                const msg = this.retrieveOldestMessage();
                const taker = this.retrieveOldestTaker();
                forwardMessage(taker, msg);
            }
        });
    }

    /**
     * Some data streams inserted into a channel are asynchronous
     * for example those coming from operators like fromAsyncIterable, fromAsyncIterableDelayed,
     * pipe, and those coming from static utilities like merge and mergeDelayed.

     * If values were inserted using above mentioned functions and, subsequently,
     * the drain method is called, we have to see those values into the channel.

     * The solution is to defer the drain method into a subsequent
     * microtask with the lowest priority due to the setTimeout behaviour.
     */
    public async drain(): Promise<T[]> {
        await new Promise(resolve => setTimeout(resolve, 0));

        const msgs = [];
        while (this.areThereMessages()) {
            msgs.push(this.take());
        }
        return Promise.all(msgs);
    }

    public race(): Promise<Channel<T>> {
        return new Promise(resolve => {
            this.waitTheChannel(resolve);

            if (this.isThereAlreadyAPendingPutter()) {
                const racer = this.retrieveOldestRacer();
                this.fulfillTheRacer(racer);
            }
        });
    }

    public prependMessage(msg: T): void {
        this[messages].unshift(msg);
    }

    public waitATakerOrARacer(resolve: () => void): void {
        this[putters].unshift(resolve);
    }
    public isThereAlreadyAPendingTaker(): boolean {
        return !!this[takers].length;
    }
    public unwaitOldestPutter(): void {
        const resolve = this[putters].pop()
        resolve();
    }
    public retrieveOldestMessage(): T {
        return this[messages].pop();
    }
    public retrieveOldestTaker(): ((msg: T) => void) {
        return this[takers].pop();
    }
    public waitAPutter(resolve: (msg: T) => void): void {
        this[takers].unshift(resolve);
    }
    public isThereAlreadyAPendingPutter(): boolean {
        return !!this[putters].length;
    }
    public waitTheChannel(resolve: (ch: Channel<T>) => void): void {
        this[racers].unshift(resolve);
    }
    public retrieveOldestRacer(): ((ch: Channel<T>) => void) {
        return this[racers].pop();
    }
    public isThereAPendingRacer(): boolean {
        return !!this[racers].length;
    }
    public areThereMessages(): boolean {
        return !!this[messages].length;
    }
    public fulfillTheRacer(racer: (ch: Channel<T>) => void): void {
        racer(this);
    }
}

/* atomic private methods */
/**
 * Responsible of sending a value to a taker
 */
function forwardMessage<T>(taker: (msg: T) => void, msg: T): void {
    taker(msg);
}

// exports
export { Channel, ChannelImp, racers };