const messages = Symbol('messages');
const putters = Symbol('putters');
const takers = Symbol('takers');
const racers = Symbol('racers');

interface Channel<T> {
    [messages]: T[];
    [putters]: (() => void)[];
    [takers]: ((msg: T) => void)[];
    [racers]: ((ch: Channel<T>) => void)[];
    [Symbol.asyncIterator]: (() => AsyncIterableIterator<T>);
    put(msg: T): Promise<void>;
    take(): Promise<T>;
    drain(): Promise<T[]>;
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

            // if both a taker and a racer were waiting a message
            // the priority is given to the taker that will retrieve 
            // the message
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

    public drain(): Promise<T[]> {
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
function forwardMessage<T>(taker: (msg: T) => void, msg: T): void {
    taker(msg);
}

// exports
export { Channel, ChannelImp, racers };