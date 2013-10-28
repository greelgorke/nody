# Ninja-Dragon

A toolkit for streaming architecture.

## Fun

Ninjas are cool, dragons are fun. Ninja-Dragons are both. And you can ride them.

## What's that?

This is my fun project. But it is also considered to be productive as well. I hope it helps me and you to reconsider the way how we build Node.js apps and causes a mind switch.

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