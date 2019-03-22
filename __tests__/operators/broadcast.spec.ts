import { Channel } from '../../src';
import '../../src/operators/broadcast';


const msg = (() => {
    let i = 0;
    return () => ++i;
})();


describe('[csp] operator broadcast', () => {

    const source = new Channel();
    const dest1 = new Channel();
    const dest2 = new Channel();
    const dest3 = new Channel();

    source.broadcast(dest1, dest2, dest3);

    const m = msg();
    source.put(m);

    test('should resolve the correct value', async () => {
        expect(await dest1.take()).toBe(m);
        expect(await dest2.take()).toBe(m);
        expect(await dest3.take()).toBe(m);
    });

});