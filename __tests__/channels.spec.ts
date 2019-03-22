import { Channel } from '../src';


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] put', () => {

    test('should return an instance of a Promise', () => {
        const chan = new Channel<string>();
        const res = chan.put('foo');
        expect(res instanceof Promise).toBe(true);
    });

});

describe('[csp] take', () => {

    test('should return an instance of a Promise', () => {
        const chan = new Channel();
        const res = chan.take();
        expect(res instanceof Promise).toBe(true);
    });

});

describe('[csp] drain', () => {

    const chan = new Channel<number>();
    const messages = [msg(), msg(), msg(), msg(), msg()];
    messages.forEach(m => chan.put(m));
    const res = chan.drain();

    test('should return an instance of a Promise', () => {
        expect(res instanceof Promise).toBe(true);
    })
 
    test('should drain the channel', async () => {
        expect(await res).toEqual(messages);
    })

});

describe('[csp] take, already put', () => {

    test('should resolve the correct value', async () => {
        const chan = new Channel<number>();
        const m = msg();
        chan.put(m);
        const res = await chan.take();
        expect(res).toEqual(m);
    });

});

describe('[csp] put, already taking', () => {

    test('should resolve the correct value', async () => {
        const chan = new Channel<number>();
        const m = msg();
        const result = chan.take();
        await chan.put(m);
        const res = await result;
        expect(res).toEqual(m);
    });

});

describe('[csp] take with asynciterable interface', () => {

    test('should resolve the correct value', async () => {
        const chan = new Channel<number>();
        const m = msg();
        chan.put(m);
        const res = (await chan[Symbol.asyncIterator]().next()).value;
        expect(res).toEqual(m);
    });

});