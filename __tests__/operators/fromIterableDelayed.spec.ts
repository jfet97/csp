import { Channel } from '../../src';
import '../../src/operators/fromIterableDelayed';


describe('[csp] operator fromIterableDelayed', () => {

    const chan = new Channel<number>();
    const iterable = {
        *[Symbol.iterator]() {
            let i = 0;
            while (true) {
                yield i++;
            }
        }
    };

    chan.fromIterableDelayed(iterable);

    test('should resolve the correct values', async () => {
        expect(await chan.take()).toBe(0);
        expect(await chan.take()).toBe(1);
        expect(await chan.take()).toBe(2);
        expect(await chan.take()).toBe(3);
    });

});