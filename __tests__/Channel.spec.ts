import { Channel } from '../src';

type Input = string | number;


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] Channel.alts', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const res = Channel.alts(chan1, chan2);

    test('should return an instance of a Promise', () => {
        expect(res instanceof Promise).toBe(true);
    });

});

describe('[csp] Channel.alts, chan1 ready', () => {

    const chan1 = new Channel<number>();
    const chan2 = new Channel<string>();
    const m = msg();
    const result = Channel.alts<Input>(chan1, chan2);

    test('should receive the correct value', async () => {
        await chan1.put(m);
        const res = await result;
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.alts, chan2 ready', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const m = msg();
    const result = Channel.alts(chan1, chan2);

    test('should receive the correct value', async () => {
        await chan2.put(m);
        const res = await result;
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Array, chan1 ready', () => {

    const chan1 = new Channel<number>();
    const chan2 = new Channel<string>();
    const m = msg();
    const result = Channel.select<Input>([chan1, chan2]);

    test('should receive the correct key and value', async () => {
        await chan1.put(m);
        const [key, res] = await result;

        expect(key).toEqual(0);
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Array, chan2 ready', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const m = msg();
    const result = Channel.select([chan1, chan2]);

    test('should receive the correct key and value', async () => {
        await chan2.put(m);
        const [key, res] = await result;

        expect(key).toEqual(1);
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Map, chan1 ready', () => {

    const chan1 = new Channel<number>();
    const chan2 = new Channel<string>();
    const m = msg();
    const key1 = Symbol();
    const key2 = Symbol();
    const result = Channel.select<Input>(new Map<symbol, Channel<Input>>([[key1, chan1], [key2, chan2]]));

    test('should receive the correct key and value', async () => {
        await chan1.put(m);
        const [key, res] = await result;

        expect(key).toEqual(key1);
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Map, chan2 ready', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const m = msg();
    const putter = chan2.put(m);
    const key1 = Symbol();
    const key2 = Symbol();
    const result = Channel.select(new Map([[key1, chan1], [key2, chan2]]));

    test('should receive the correct key and value', async () => {
        await putter;
        const [key, res] = await result;

        expect(key).toEqual(key2);
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Object, chan1 ready', () => {

    const chan1 = new Channel<number>();
    const chan2 = new Channel<string>();
    const m = msg();
    const result = Channel.select<Input>({ a: chan1, b: chan2 });

    test('should receive the correct key and value', async () => {
        await chan1.put(m);
        const [key, res] = await result;

        expect(key).toEqual('a');
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Object, chan2 ready', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const m = msg();
    const putter = chan2.put(m);
    const result = Channel.select({ a: chan1, b: chan2 });

    test('should receive the correct key and value', async () => {
        await putter;
        const [key, res] = await result;

        expect(key).toEqual('b');
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Set, chan1 ready', () => {

    const chan1 = new Channel<number>();
    const chan2 = new Channel<string>();
    const m = msg();
    const result = Channel.select<Input>(new Set([chan1, chan2]));

    test('should receive the correct key and value', async () => {
        await chan1.put(m);
        const [key, res] = await result;

        expect(key).toEqual(chan1);
        expect(res).toEqual(m);
    });

});

describe('[csp] Channel.select Set, chan2 ready', () => {

    const chan1 = new Channel();
    const chan2 = new Channel();
    const m = msg();
    const putter = chan2.put(m);
    const result = Channel.select(new Set([chan1, chan2]));

    test('should receive the correct key and value', async () => {
        await putter;
        const [key, res] = await result;

        expect(key).toEqual(chan2);
        expect(res).toEqual(m);
    });

});

import '../src/operators/fromIterable';

describe('[csp] Channel.merge', () => {

    test('should resolve the correct value', async () => {
        const chan1 = new Channel();
        const chan2 = new Channel();

        const result = Channel.merge(chan1, chan2);

        chan1.fromIterable([1, 2, 3]);
        chan2.fromIterable([4, 5, 6]);

        expect(await result.drain()).toEqual([1,4,2,5,3,6]);
    });

});

describe('[csp] Channel.mergeDelayed', () => {

    test('should resolve the correct value', async () => {
        const chan1 = new Channel();
        const chan2 = new Channel();

        const result = Channel.mergeDelayed(chan1, chan2);

        chan1.fromIterable([1, 2, 3]);
        chan2.fromIterable([4, 5, 6]);

        // thanks to mergeDelayed only the first value contained in chan1 and the first value
        // contained in chan2 will flow into result

        expect(await result.drain()).toEqual([1,4]);
    });

});
