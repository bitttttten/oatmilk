# Server rendering

..is really simple. Just send in the URL.

Here are some really simplified examples:

## hapijs

```js
exports.method = function method(request, h) {
    return (
        <oatmilk.Provider url={request.url.path} routes={routes}>
            <App />
        </oatmilk.Provider>
    )
}
```

## lambda

```js
exports.handler = function handler({ queryStringParameters, path }) {
    // lambdas strip the query params from the path into an object
    // so you must build them back into a string with the path
    const qs = Object.keys(event.queryStringParameters).map(
        k => `${k}=${event.queryStringParameters[k]}`,
    )
    const suffix = qs.length ? `?${qs.join('&')}` : ''

    return (
        <oatmilk.Provider url={`${path}${suffix}`} routes={routes}>
            <App />
        </oatmilk.Provider>
    )
}
```

## Data fetching with transition hooks

If it's your first time fetching data on the server with React, then this can seem a little complicated.

Ensure that you have the appropriate hook on your route:

```js App.tsx
export const routes: IRoutes = [
    {
        name: 'home',
        path: '/',
        view: HomePageView,
        onEnter: async () => {
            await Promise.all([
                ArticleAPI.fetchTrending(),
                ContentfulAPI.fetchRecentBlogPosts(),
            ])
        },
    },
    {
        name: 'user',
        path: '/user/:id',
        view: HomePageView,
        onEnter: async (_, state) => {
            await UserAPI.fetchById(state.id)
        },
    },
]
```

And when rendering your view, await on the route's onEnter hook:

```js server/controller/web.tsx
const { Provider, getRouteFromUrl } = require('oatmilk')
const { routes, App } = require('./App')

module.exports = async function webController(url) {
    // get the current route
    const { onEnter } = getRouteFromUrl(routes, url)

    // wait for the hook to resolve
    if (onEnter) await onEnter()

    // use the provider, inject the correct url
    const jsx = (
        <Provider routes={routes} url={url}>
            <App />
        </Provider>
    )

    // ..and go!
    const html = renderToString(jsx)

    return html
}
```
