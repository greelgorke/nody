# Nody

A toolkit for streaming architecture.

**WORK IN PROGRESS**

## Fun
This project is in very first place for my personal fun. BUT! It's also supposed to be a toolkit, that helps you to think in Node.js paradigm of small and simple but powerful modules. It should show you the way to think different about your node application architecture.

## What's that?

The idea is to step back and to look at the apps as a collection of data transformations, which are chained and dispatched. Usual http server is a transformer of `http.IncomingMessage` -> `http.ServerResponse`. The notation is inspired by Haskell, so `->` is a function. This function can be defined as a row of sub-functions. So a webserver might be that:

    http.IncomingMessage -> ParsedMessage -> RoutedParsedMessage -> ProcessedMessage -> http.ServerResponse

and so on.

This toolkit is supposed to help you to translate this functions into streams. So your server would look like this:

    app
      .pipe(parser)
      .pipe(router)
        .route(routeTransformer)
        .route(otherRouteTransformer)
      .pipe(responder)
    .pipe(app)

Of course you will not find everything here. But you could easily create your own streams with this toolkit. Also there are some extensions.