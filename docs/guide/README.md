---
title: Introduction
---

# Introduction

This is a library for CSP in JavaScript, built on top of `async/await` and the asynchronous iterable interface.

## What is CSP?

CSP stands for __Communicating Sequential Processes__, a model to coordinate concurrency that was described by Richard Hoare in a book of the same name from 1978. \
CSP is based on two main primitives: __processes__ and __channels__.

Due to the single-thread nature of JavaScript, the term process does not refer to an OS process. \
It alludes to an entity in the code designed to fulfill a specific task, a piece of code that can complete a unit of work independently.

ES2017 took to us  __async functions__, which correspond to the above description. Their execution can be paused thanks to the __await__ keyword, therefore this type of function can be run concurrently faking threads.

CSP says that processes cannot share memory. What if they need to communicate with each other? \
In such case [channels](/guide/channels.html) come into action!

## Installation

```sh
$ npm install --save @jfet97/csp
```

## Example Usage

Below is a trivial example of usage, that plays on the standard ping-pong example.

```js
const { Channel } = require('@jfet97/csp');
// or...
import { Channel } from '@jfet97/csp';

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

With the following result:

![pingpong](/@jfet97-csp/assets/pingpong.gif)

## Async Iteration Protocol

Channels implement the async iterable interface, so you can transform the following illustrative code:

```js
async function process (inbound, outbound) {
  while (true) {
    const msg = await inbound.take();
    // do stuff with msg
    await outbound.put(res);
  }
};
```

into a cleaner version, thanks to the powerful `for-await-of`:

```js
async function process (inbound, outbound) {
  for await(const msg of inbound) {
    // do stuff with msg
    await outbound.put(res);
  }
};
```

## Credits

Thanks to [Joe Harlow](https://twitter.com/someonedodgy) for his work on this topic. If you are unfamiliar with CSP, I encourage you to see [his talk](https://pusher.com/sessions/meetup/the-js-roundabout/csp-in-js) where he describe a simpler version of this library as well.