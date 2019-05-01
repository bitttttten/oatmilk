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

If it's your first time fetching data on the server with React, then this can seem a little complicated. Here's a real life example.

Full docs coming soon.

Client side:

```js index.jsx
/** @jsx jsx */
import { jsx } from '@emotion/core'
import oatmilk from 'oatmilk'
import ReactDOM from 'react-dom'
import App from './App'
import routes from './routes'
import { Store } from './stores'
import { TDefaultHookCallee, IRoute, TRouteState } from 'oatmilk'

const Store = makeStore()

export type OatmilkHookCallee = TDefaultHookCallee
export type OatmilkHook = (
    toRoute: IRoute,
    toState: TRouteState,
    Store: any,
) => Promise<void>

function hookCallee(route: IRoute, state: TRouteState) {
    return (hook: OatmilkHook) => hook(route, state, Store)
}

const OatmilkProvider = (
    args: oatmilk.IProvider<OatmilkHookCallee, OatmilkHook>,
) => oatmilk.Provider(args)

export default function App() {
    return (
        <OatmilkProvider routes={routes} hookCallee={hookCallee}>
            <App>
                <oatmilk.RouterView />
            </App>
        </OatmilkProvider>
    )
}
```

Server:

```jsx index.js
const React = require('react')
const { renderToString } = require('react-dom/server')
const { Provider, getMatchWithCalleeFromUrl } = require('oatmilk')
const { routes, default: App, makeServerStore, StoreProvider } = require('./yourServerEntryPoint')

module.exports = async function webController(url) {
    const Store = makeServerStore()

    function hookCallee(route, state) {
        return hook => hook(route, state, Store)
    }

    try {
        // await on oatmilk's transition hooks
        await getMatchWithCalleeFromUrl(hookCallee, routes, url)
    } catch (e) {
        console.error(
            '[web:controller:getMatchWithCalleeFromUrl]', e
        )
    }

    const jsx = (
        <StoreProvider value={Store}>
            <oatmilk.Provider routes={routes} url={url}>
                <App>
                    <oatmilk.RouterView />
                </App>
            </oatmilk.Provider>
        </StoreProvider>
    )

    return renderToString(jsx)
```
