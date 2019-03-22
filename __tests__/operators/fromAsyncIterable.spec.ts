import { Channel } from '../../src';
import '../../src/operators/fromAsyncIterable';


describe('[csp] operator fromAsyncIterable', () => {

    const chan = new Channel<number>();
    const asyncIterable = {
        async *[Symbol.asyncIterator]() {
            yield* [1, 2, 3, 4, 5];
        }
    };

    test('should resolve the correct value', async () => {

        (async function process1() {
            chan.fromAsyncIterable(asyncIterable);
        })();

        await (async function process2() {

            expect(await chan.take()).toEqual(1);

            // fromAsyncIterable() does not wait take operations after entering a value into the channel
            // so after a null timeout (needed by how microtasks are resolved) we can drain
            // all the remaining values from the channel
            // because the internal for-await-of can iterate without disruptions
            expect(await chan.drain()).toEqual([2, 3, 4, 5]);
        })();
    });

});