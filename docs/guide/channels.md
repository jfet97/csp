# Channels

Channels are the pipes that connect concurrent processes. You can send values into channels from one process and receive those values into another process.

## Channel Constructor

This constructor constructs a new `channel` and returns it. A channel exposes some methods to interact with it.

```js
const chan = new Channel();
```

## Methods

### put

`channel.put(message)` -> `Promise`

The `put` method takes a `message` and put it into the channel on which it was called. The `put` method returns a `Promise` which can be optionally awaited and will resolve when something is ready to take the `message` from the `channel`.

```javascript
const chan = new Channel();
chan.put(42);

// ...or...

await chan.put(42);
```

### take

`channel.take()` -> `Promise`

The `take` method requires no arguments. The `take` method returns a `Promise` which should always be awaited and will resolve with a message, when a message is available.

```javascript
const chan = new Channel();
chan.put(42);

const msg = await chan.take(); // will receive 42
```

### drain

`channel.drain()` -> `Promise`

The `drain` method requires no arguments. The `drain` method will drain all messages until the channel empties, returning a `Promise` that will resolve into an array of messages.

```javascript
const chan = new Channel();
chan.put(42);
chan.put(41);
chan.put(40);
chan.put(39);

const msgs = await chan.drain(); // will receive [ 42, 41, 40, 39 ]
```

### [Symbol.asyncIterator]

`channel[Symbol.asyncIterator]()` -> `AsyncIterableIterator`

Return an async iterator that will iterate over the channel. This enables the following syntax:

```javascript
for await(const msg of chan) {
    // do stuff with each message 
}
```

that is a valid substitute of:

```javascript
while(true) {
    const msg = await chan.take();
    // do stuff with each message 
}
```

## Static Utilities

### alts

`Channel.alts(...channels)` -> `Promise`

The `alts` static method will race taking values from multiple `channels`.

```javascript
const chan1 = new Channel();
const chan2 = new Channel();

chan2.put(42);
const msg = await Channel.alts(chan1, chan2); // will receive 42
```

### select

`Channel.select(Map<*, channel>|Set<channel>|Array<channel>|Object<string, channel>)` -> `Promise`

The `select` static method will race taking values from multiple `channels`, similar to `alts`, but will also return the key of the channel that was selected.

```javascript
const chan1 = new Channel();
const chan2 = new Channel();

chan2.put(42);
const channels = [chan1, chan2];
const result = await Channel.select(channels); // will receive [1, 42]
```

Works with `Map` and `Set` as well as with plain-old javascript arrays and objects.

### merge

`Channel.merge(...channels)` -> `channel`

The `merge` static method will merge together multiple `channels`, returning a new one that will receive each value inserted into one of its input `channels`. 
As soon as a value is available from one of the input `channels`, it will be putted into the resulting `channel`.

```javascript
const chan1 = new Channel();
const chan2 = new Channel();

const resCh = Channel.merge(chan1, chan2);

chan1.put(1);
chan1.put(2);
chan1.put(3);
chan2.put(4);
chan2.put(5);
chan2.put(6);

// the 'merge' static method let all the values contained into the input channels to flow
const result = await resCh.drain(); // will receive [1, 4, 2, 5, 3, 6]
```

### mergeDelayed

`Channel.mergeDelayed(...channels)` -> `channel`

The `mergeDelayed` static method will merge together multiple `channels`, returning a new one that will receive each value inserted into one of its input `channels`. 
Before taking the next value from one of the input `channels`, a corresponding `take` operation will be waited (implicitly contained into the `drain` method).

```javascript
const chan1 = new Channel();
const chan2 = new Channel();

const resCh = Channel.mergeDelayed(chan1, chan2);

chan1.put(1);
chan1.put(2);
chan1.put(3);
chan2.put(4);
chan2.put(5);
chan2.put(6);

// the 'mergeDelayed' static method let only one value contained
// into each input channels (if present) to flow
const result = await resCh.drain(); // will receive [1, 4]
```