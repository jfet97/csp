import { Channel } from '../../src';
import '../../src/operators/fromAsyncIterableDelayed';


describe('[csp] operator fromAsyncIterable', () => {

    const chan = new Channel<number>();
    const asyncIterable = {
        async *[Symbol.asyncIterator]() {
            yield* [1, 2, 3, 4, 5];
        }
    };

    test('should resolve the correct value', async () => {

        (async function process1() {
            chan.fromAsyncIterableDelayed(asyncIterable);
        })();

        await (async function process2() {

            expect(await chan.take()).toEqual(1);

            // fromAsyncIterable() does wait a take operations after entering a value into the channel
            // so after a null timeout (needed by how microtasks are resolved) we can drain
            // only the next value,
            expect(await chan.drain()).toEqual([2]);
        })();
    });

});