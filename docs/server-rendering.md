# Server rendering

..is really simple. Just send in the URL.

Here are some really simplified examples:

## hapijs

```js
exports.method = function method(request, h) {
    return (
        <oatmilk.RouterProvider url={request.url.path} routes={routes}>
            <App />
        </oatmilk.RouterProvider>
    )
}
```

## lambda

```js
exports.handler = function handler({ queryStringParameters, path }) {
    // lambdas strip the query params from the path
    // so you must build them back into a string with the path
    const qs = Object.keys(event.queryStringParameters).map(
        k => `${k}=${event.queryStringParameters[k]}`,
    )
    const suffix = qs.length ? `?${qs.join('&')}` : ''

    return (
        <oatmilk.RouterProvider url={`${path}${suffix}`} routes={routes}>
            <App />
        </oatmilk.RouterProvider>
    )
}
```
