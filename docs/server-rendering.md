# Server rendering

..is really simple. Just send in the path as `url` into the Provider.

Here are some really simplified examples:

## hapijs

hapijs includes query params on it's url object. oatmilk is only suited to parse the path of a URL, so you must first strip the query parameters out.

```js
exports.method = function method(request, h) {
    const url = request.url.path.split('?')[0]
    return (
        <oatmilk.Provider url={url} routes={routes}>
            <App />
        </oatmilk.Provider>
    )
}
```

## lambda

Please be aware that if you are using lambdas, they strip the query params from the path into an object. This is actually okay, since oatmilk is only suited to parse the path of the URL.

```js
exports.handler = function handler({ path }) {
    return (
        <oatmilk.Provider url={path} routes={routes}>
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
