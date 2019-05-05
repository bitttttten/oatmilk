# Server rendering

## Introduction

With oatmilk server rendering is really simple, just send in the path as `url` into the Provider. oatmilk is only suited to parse the path of the URL since the query paramenters have a different semantic meaning.

Let's start with some examples using popular frameworks.

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

lambdas strip the query params from the path into an object. No issue here, since oatmilk is only suited to parse the path of the URL.

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

Ensure that you have the appropriate `onEnter` hook on your route, and that it returns a Promise.

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

Then when rendering your view, await on the result of `getMatchFromUrl` which will call the `onEnter` hook of the matched route, or will resolve if none is matched.

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

You are able to customise how the transition hooks are called with a hookCallee function. Use this method to inject your own callee to completely customise the transition hooks. The hook callee is called with 2 arguments: the current route, and the state of the route. If no hookCallee is passed in, it will default to the code below which is essentially transparent currying. You must return a function which will be called in the transtion hook's phase, so you are able to call the hook with new arguments.

```js hookCallee.tsx
import { IRoute, TRouteState, THook } from 'oatmilk'

function hookCallee(route: IRoute, state: TRouteState) {
    return (hook: THook) => hook(route, state)
}
```

Here's an example of how to inject/pass an instance of your store into the route hooks and global hooks of oatmilk. Be aware that a lot of assumptions have been made in the snippets below and thus are not quite copy-and-pastable.

Client:

```js index.jsx
import React from 'react'
import { hydrate } from 'react-dom'
import oatmilk from 'oatmilk'
import App from './App'
import routes from './routes'
import { makeClientStore, StoreProvider } from './stores'

const Store = makeStore()

export type OatmilkHookCallee = oatmilk.TDefaultHookCallee
export type OatmilkHook = (
    toRoute: IRoute,
    toState: TRouteState,
    Store: any,
) => Promise<void>

function hookCallee(route: oatmilk.IRoute, state: oatmilk.TRouteState) {
    return (hook: OatmilkHook) => hook(route, state, Store)
}

const OatmilkProvider = (
    args: oatmilk.IProvider<OatmilkHookCallee, OatmilkHook>,
) => oatmilk.Provider(args)

hydrate(
    <StoreProvider value={Store}>
        <OatmilkProvider routes={routes} hookCallee={hookCallee}>
            <App>
                <oatmilk.RouterView />
            </App>
        </OatmilkProvider>
    </StoreProvider>,
    container
)
```

Server:

```jsx index.js
const React = require('react')
const { renderToString } = require('react-dom/server')
const oatmilk = require('oatmilk')
const App = require('./App')
const routes = require('./routes')
const { makeServerStore, StoreProvider } = require('./stores')

module.exports = async function Index(url) {
    const Store = makeServerStore()

    function hookCallee(route, state) {
        return hook => hook(route, state, Store)
    }

    try {
        // await on the `onEnter` transition hook of the route that oatmilk matched with
        await oatmilk.getMatchWithCalleeFromUrl(hookCallee, routes, url)
    } catch (e) {
        console.error(
            '[web:controller:getMatchWithCalleeFromUrl]', e
        )
    }

    const jsx = (
        <StoreProvider value={Store}>
            <oatmilk.Provider routes={routes} url={url} hookCallee={hookCallee}>
                <App>
                    <oatmilk.RouterView />
                </App>
            </oatmilk.Provider>
        </StoreProvider>
    )

    return renderToString(jsx)
}
```
