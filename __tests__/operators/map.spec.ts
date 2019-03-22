import { Channel } from '../../src';
import '../../src/operators/map';


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] operator map', () => {
    
    const chan = new Channel<number>();
    const m = msg();
    const n = msg();
    chan.put(m);

    test('should resolve the correct value', async() => {
        const res = await chan.map(v => n * v).take();

        expect(res).toBe(m*n);
    });
   
});