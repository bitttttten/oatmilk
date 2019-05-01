# Server rendering

## Introduction

..is really simple. Just send in the path as `url` into the Provider. oatmilk is only suited to parse the path of the URL, since the query parameters have a different semantic meaning. Although oatmilk will persist the query params and hash/fragment identifier client side on the first page load.

Let's start with some examples using some popular frameworks.

### hapijs

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

### lambda

lambdas strip the query params from the path into an object. This is actually okay, since oatmilk is only suited to parse the path of the URL.

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
        onEnter: async (route: IRoute, state: TRouteState) => {
            // see how the state object is derived from the path
            // as state.id came from `/user/:id`
            await UserAPI.fetchById(state.id)
        },
    },
]
```

And when rendering your view, await on the result of `getMatchFromUrl` which will call the `onEnter` hook of the matched route or `Promise.resolve` if none is present.

```js server/controller/web.tsx
const { Provider, getMatchFromUrl } = require('oatmilk')
const { routes, App } = require('./App')

module.exports = async function webController(url) {
    // this will call the 'onEnter' hook of the matched route
    // or resolve if no transition hook was present
    await getMatchFromUrl(routes, url)

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

You can read more about the [transition hooks](https://github.com/bitttttten/oatmilk/blob/master/docs/transition-hooks.md) here.

## Custom hook callee

If it's your first time fetching data on the server with React, then this can seem a little complicated.

Docs coming soon :)
