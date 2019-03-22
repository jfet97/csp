# @jfet97/csp

A library for Communicating Sequential Processes, built on top of `async/await` and the asynchronous iterable interface.

[![npm version](https://badge.fury.io/js/%40jfet97%2Fcsp.svg)](https://badge.fury.io/js/%40jfet97%2Fcsp)

## Installation

This library requires `async/await` and `for-await-of` support.

```
$ npm install --save @jfet97/csp
```

## Docs

You can find the documentation [here](https://jfet97.github.io/csp/).


## Example Usage

Below is a trivial example of usage, that plays on the standard ping-pong example.

```javascript
const { Channel } = require('@jfet97/csp');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const wiff = new Channel();
const waff = new Channel();

const createBall = () => ({ hits: 0, status: '' });

const createBat = async (inbound, outbound) => {
  while (true) {
    const ball = await inbound.take(); // wait for an incoming ball
    ball.hits++;
    ball.status = ball.status === 'wiff!' ? 'waff!' : 'wiff!';
    console.log(`🎾  Ball hit ${ball.hits} time(s), ${ball.status}`);
    await timeout(500); // assume it's going to take a bit to hit the ball
    await outbound.put(ball); // smash the ball back
  }
};

createBat(waff, wiff); // create a bat that will wiff waffs
createBat(wiff, waff); // create a bat that will waff wiffs

waff.put(createBall());
```

![ping pong](/assets/pingpong.gif?raw=true)


## Async Iteration Protocol
Channels implement the async iterable interface, so you can transform the following illustrative code:

```javascript
async function process (inbound, outbound) {
  while (true) {
    const msg = await inbound.take();
    // do stuff with msg
    await outbound.put(res);
  }
};
```

into a cleaner version, thanks to the powerful `for-await-of`:

```javascript
async function process (inbound, outbound) {
  for await(const msg of inbound) {
    // do stuff with msg
    await outbound.put(res);
  }
};
```

## Credits

Thanks to [Joe Harlow](https://twitter.com/someonedodgy) for his work on this topic. If you are unfamiliar with CSP, I encourage you to see [his talk](https://pusher.com/sessions/meetup/the-js-roundabout/csp-in-js) where he describe a simpler version of this library as well.

## Contributions

Contributions are welcomed and appreciated!

1. Fork this repository.
2. Make your changes, documenting your new code with comments.
3. Submit a pull request with a sane commit message.

Feel free to get in touch if you have any questions.

## License

Please see the `LICENSE` file for more information.
