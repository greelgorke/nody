# Nody

A toolkit for streaming architecture.

## Fun
This project is in very first place for my personal fun. BUT! It's also supposed to be a toolkit, that helps you to think in Node.js paradigm of small and simple but powerful modules. It should show you the way to think different about your node application architecture.

## What's that?

The idea is to step back and to look at the apps as a collection of data transformations, which are chained and dispatched. Usual http server is a transformer of `http.IncomingMessage` -> `http.ServerResponse`. The notation is inspired by Haskell, so `->` is a function. This function can be defined as a row of sub-functions. So a web server might be that:

    http.IncomingMessage -> ParsedMessage -> RoutedParsedMessage -> ProcessedMessage -> http.ServerResponse

and so on.

This toolkit is supposed to help you to translate this functions into streams. So your application may look like this:

```javascript
consumer
  .pipe(parser)
  .pipe(validator)
  .pipe(router)
    router.route(route1)
    router.route(route2)
  router.pipe(render)
  .pipe(catchAll)
```

Of course you will not find everything here. But you could easily create your own streams with this toolkit. Also there are/will be some extensions.

## Install

currently not to install from public npm. if you want to try it out, you can just install from github:

```javascript
npm install greelgorke/nody.git

```

## Usage

it's quite simple.

### Nody

```javascript
var nody = require('nody')
```

`nody` is the entry point to the tool belt

currently it consist of few streams. They conform to Node.js core streams, but are all in object mode. Even more, they only accept to pipe to streams which are in objectMode too. otherwise your pipeline will not work as expected.

### Cons

To start you need a `cons` stream. This stream consumes anything and prepares it to be passed down the pipeline

```javascript
var myCons = nody.cons()
```

you can just `.write()` a single value to it or `.pack()` and `.submit()` a bunch of values. You can call `.pack()`several times with any amount of parameters. When you call `.submit()`, all values packed before will be written as a single batch to the pipeline:

```javascript
myCons.pack( val1, val2 )
myCons.pack( val3 )
myCons.submit() // val1, val2, val3 are handled together.
```

It is important to understand, that the order and the amount of the packed values is important. This is what your following streams will get always in a one call. So a next step in the pipeline would call `yourFunc(val1, val2, val3)` This order will be hold consistent, unless you decide to replace it with something else later.


### Node

This is a stream representing a single transformation step in your pipeline. whenever you do something with a value this is your stream.

```javascript
var myStep = nody.node( processor )
myCons.pipe(myStep)
```

`processor` is a function:

```javascript
function myProcessor( param1... , callback){}
```

the processor function will get all the parameters as passed to cons and an additional callback function. You may do in this function, what ever you need, then call the callback.

If you call the callback, there are 3 options:

* call it without params `callback()`: This is the usual step. you transform one or more values, tell node stream to pass them to the next step
* call it with an error object `callback(new Error())`: in this case an 'error' event will emit and you have to handle it somewhere.
* call it with new content `callback(null, val1, val2)`: this will replace the values stored in the pipeline with the new ones.

You also might decide that there is no need to process any further in the pipeline. then just not call the callback and be it.

### Sink

This stream works similar but meant to be the dead end of the pipeline.

```javascript
var sink = nody.sink(catchLast)
```

catchLast is similar to the processor function in `node` but it is called without a callback parameter. This is your last chance to do something with the pipeline payload.

### Cond

This stream is a if/else or switch/case of this toolbelt.

```javascript
var myCond = nody.cond()
```

the `.pipe()` method of this stream is overloaded and is able to take a function with a stream:

```javascript
myCond.pipe(matchFn1, stream1)
myCond.pipe(matchFn2, stream2)
```

the order of this pipes is significant. When `cond` receives payload it calls the match functions in the same way as processor function in `node` and expects an optional error object or a boolean value.

It is also possible to just pipe a stream. In this case this stream is a catch-all stream. It will get every payload passing the `cond` stream. This almost to ensure compatibility with the core api.

### Merge

The core streams allow already to pipe a stream multiple times. So it is already easy to "parallelize" execution. What lacks is the ability to synchronize, to merge parallel processed payload. This is what the `merge` stream is for.

```javascript
var merge = nody.merge( mergerFunction, shouldMergeCheck )
```

The piped payload is already prepared for merging, but the strategy is unclear. `merge` take one required and two optional parameters.

A merger function is a function, which takes two argument arrays and a callback:

```javascript
function mergerFunction( arr1, arr2, callback ){
    callback( null, deepMerge( arr1, arr2 ) )
}
```

The mergerFunction works slightly similar as a function which you would pass to Array#reduce. In fact this is what happens under the hood. `arr1` is an array of previous merges, at first call it is the first appeared payload. `arr2` is the next payload array and may be null, when the merger is called before a second appearance of a payload occurs. The merger must call the callback with the merge result or error.

The shouldMergeCheck is an fully optional. You may pass a number or a function. If a number is passed, the merge will buffer this amount of payload versions before start merging. If a function is passed, this function is called on ever appearance of a payload version with following parameters:

```javascript
shouldMergeCheck.call(null, payloadVersionsArray, numberOfInputPipes)
```

`payloadVersionsArray` in this case is an array of arrays. you can introspect different constrains or just compare the length of this array with the numberOfInputPipes. or you can do whatever you want, as long as it's synchronous. The shouldMergeCheck function have to return a boolean value.


### Subnode

This is the last stream from the toolbelt and can be used to plug in a secondary pipeline.

```javascript
var sub = nody.subnode(consumer, producer1, producer2)

someotherStream.pipe(sub).pipe(anotherOtherStream)
```

To create a subnode you have to pass at least one stream which will consume the payload and zero or more producer streams, which will produce it.