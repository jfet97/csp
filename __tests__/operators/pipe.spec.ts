import { Channel } from '../../src';
import '../../src/operators/fromIterable';
import '../../src/operators/pipe';


describe('[csp] operator pipe', () => {

    const source = new Channel();
    const dest = new Channel();

    // pipe the channels
    const resCh = source.pipe(dest);
    test('should resolve the correct value', () => {
        expect(resCh).toBe(dest);
    });

    // put three numbers into the source
    source.fromIterable([1, 2, 3]);

    test('should resolve the correct values', async () => {
        // before the next value is taken from the source channel, pipe() will await 
        // a take operation (implicitily contained into the drain() method)
        expect(await dest.drain()).toEqual([1]);
        expect(await dest.drain()).toEqual([2]);
        expect(await dest.drain()).toEqual([3]);
    })
});