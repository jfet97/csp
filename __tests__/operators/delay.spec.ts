import { Channel } from '../../src';
import '../../src/operators/delay';


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] operator delay', () => {

    test('should resolve the correct value', async () => {
        const chan = new Channel<number>();
        
        const m = msg();
        chan.put(m);

        const now = process.hrtime()[0];
        await chan.delay(3000).take();
        const later = process.hrtime()[0];
        const timeDifferenceInSeconds = later - now;

        expect(timeDifferenceInSeconds).toBeGreaterThanOrEqual(3);

    });
  
});