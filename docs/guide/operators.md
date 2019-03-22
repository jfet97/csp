# Operators

Operators are optionally addable methods that enable various manipulation of channels.

## Instances Methods

These methods could be added to the instances created by the `Channel` constructor.

### broadcast

`source.broadcast(...channels)` -> `source`

The `broadcast` method enables multicasting from one `channel` to multiple `channels`. As soon as a value is inserted into the source, it will be emitted to listening channels.

```js
require("@jfet97/csp/dist/operators/broadcast");
// or...
import "@jfet97/csp/dist/operators/broadcast";


const source = new Channel();
const dest1 = new Channel();
const dest2 = new Channel();
const dest3 = new Channel();

source.broadcast(dest1, dest2, dest3);

const m = 42;
source.put(m);

const res1 = await dest1.take(); // will receive 42
const res2 = await dest1.take(); // will receive 42
const res3 = await dest1.take(); // will receive 42
```

### delay

`source.broadcast(number)` -> `channel`

The `delay` method creates a new channel that will receive all the values coming from its `source`, but with a delay expressed in milliseconds.

```js
require("@jfet97/csp/dist/operators/delay");
// or...
import "@jfet97/csp/dist/operators/delay";


const source = new Channel();
const delayed = source.delay(3000);

source.put(42);

const res = await delayed.take(); // will receive 42 after 3 seconds
```

### filter

`source.filter(value => boolean)` -> `channel`

The `filter` method takes a `predicate` function and returns a new channel. Each value inserted into the `source` will be passed to the `predicate`, and only those who make the function to return `true` will be inserted into the returned `channel`. The others will be discarded.

```js
require("@jfet97/csp/dist/operators/filter");
// or...
import "@jfet97/csp/dist/operators/filter";


const source = new Channel();
const resCh = source.filter(v => Boolean(v % 2));

source.put(1);
source.put(2);
source.put(3);
source.put(4);
            
const result1 = await resCh.take(); // will receive 1
const result2 = await resCh.take(); // will receive 3
```

### map

`source.map(value => value)` -> `channel`

The `map` method takes a `mapper` function and returns a new channel. Each value inserted into the `source` will be passed to the `mapper` function and the result of each computation will be inserted into the returned `channel`.

```js
require("@jfet97/csp/dist/operators/map");
// or...
import "@jfet97/csp/dist/operators/map";
  

const source = new Channel();
const resCh = source.filter(v => 10 * v);

source.put(1);
source.put(2);
source.put(3);
source.put(4);
            
const result1 = await resCh.take(); // will receive 10
const result2 = await resCh.take(); // will receive 20
const result3 = await resCh.take(); // will receive 30
const result4 = await resCh.take(); // will receive 40
```

### pipe

`source.pipe(dest)` -> `dest`

The `pipe` method simply takes alle the values from the `source` and insert them into the `dest`. It returns the destination `channel` to allow chained operations on it.

```js
require("@jfet97/csp/dist/operators/pipe");
// or...
import "@jfet97/csp/dist/operators/pipe";
  

const source = new Channel();
const dest = new Channel();
source.pipe(dest);

source.put(1);
source.put(2);
source.put(3);
source.put(4);
            
const result1 = await dest.take(); // will receive 1
const result2 = await dest.take(); // will receive 2
const result3 = await dest.take(); // will receive 3
const result4 = await dest.take(); // will receive 4
```

### fromIterable

`channel.fromIterable(iterable)` -> `channel`

The `fromIterable` method takes all the values from a synchronous iterable and puts them all synchronously into the `channel`.
Do not use with endless iterables.

```js
require("@jfet97/csp/dist/operators/fromIterable");
// or...
import "@jfet97/csp/dist/operators/fromIterable";


const chan = new Channel();
const iterable = [1, 2, 3];

chan.fromIterable(iterable);

const result = await chan.drain(); // will receive [1, 2, 3]
```

### fromIterableDelayed

`channel.fromIterableDelayed(iterable)` -> `channel`

The `fromIterableDelayed` method takes all the values from a synchronous iterable and puts them into the `channel`, waiting that a value is taken from the `channel` before put the next one.

```js
require("@jfet97/csp/dist/operators/fromIterableDelayed");
// or...
import "@jfet97/csp/dist/operators/fromIterableDelayed";


const chan = new Channel();
const iterable = [1, 2, 3];

chan.fromIterableDelayed(iterable);

const result = await chan.drain(); // will receive [1]
```

### fromAsyncIterable

`channel.fromAsyncIterable(asyncIterable)` -> `channel`

The `fromAsyncIterable` method takes each values from an asynchronous iterable and puts them into the `channel`.
A take operation won't be waited, therefore as soon as a new value is available it will be inserted into the `channel`.

```js
require("@jfet97/csp/dist/operators/fromAsyncIterable");
// or...
import "@jfet97/csp/dist/operators/fromAsyncIterable";


const chan = new Channel();
const asyncIterable = {
    async *[Symbol.asyncIterator]() {
        yield* [1, 2, 3, 4, 5];
    }
};

chan.fromAsyncIterable(asyncIterable);

const result = await chan.drain(); // will receive [1, 2, 3, 4, 5]
```

### fromAsyncIterableDelayed

`channel.fromAsyncIterableDelayed(asyncIterable)` -> `channel`

The `fromAsyncIterableDelayed` method takes all the values from an asynchronous iterable and puts them into the `channel`, waiting that a value is taken from the `channel` before put the next one.

```js
require("@jfet97/csp/dist/operators/fromAsyncIterableDelayed");
// or...
import "@jfet97/csp/dist/operators/fromAsyncIterableDelayed";


const chan = new Channel();
const asyncIterable = {
    async *[Symbol.asyncIterator]() {
        yield* [1, 2, 3, 4, 5];
    }
};

chan.fromAsyncIterableDelayed(asyncIterable);

const result = await chan.drain(); // will receive [1]
```