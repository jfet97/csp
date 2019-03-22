import { Channel } from '../../src';
import '../../src/operators/fromIterable';


describe('[csp] operator fromIterable', () => {
    
    const chan = new Channel<number>();
    const iterable = [1, 2, 3];
    chan.fromIterable(iterable);

    test('should resolve the correct values', async () => {
        expect(await chan.take()).toBe(1);
        expect(await chan.take()).toBe(2);
        expect(await chan.take()).toBe(3);
    });

});