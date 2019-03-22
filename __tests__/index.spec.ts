import { Channel } from '../src';

describe("it works", () => {

    test("should work", () => {
        expect(true).toBe(true);
    });

});

describe('[csp] channel', () => {

    const chan = new Channel<number>();

    test("should contain 4 symbol properties", () => {
        expect(Object.getOwnPropertySymbols(chan.getInnerChannel()).length).toBe(4);
    });
    
    test("should contain 1 symbol property", () => {
        expect(Object.getOwnPropertySymbols(Object.getPrototypeOf(chan)).length).toBe(1);
    });

});