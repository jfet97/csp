import { Channel } from '../../src';
import '../../src/operators/filter';


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] operator filter', () => {

    const chan = new Channel<number>();
    const m = msg(), n = msg(), o = msg(), p = msg();
    chan.put(m);
    chan.put(n);
    chan.put(o);
    chan.put(p);
    const resCh = chan.filter(v => Boolean(v % 2));

    test('should resolve the correct value', async() => {
        const v = await resCh.take();

        expect(v).toBe(m);
    });

    test('should resolve the correct value', async() => {
        const v = await resCh.take();

        expect(v).toBe(o);
    });
    
});