# oatmilk

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Introduction

oatmilk is a minimal, decoupled, routing library for React.

✅ SSR Friendly

✅ React friendly API

✅ Flexible

✅ Testable

✅ [Decoupled](#decoupled)

## Instructions

### Install

`yarn add oatmilk`

### Wrap your App and send in routes

```js index.tsx
import oatmilk from 'oatmilk'

const routes: oatmilk.IRoutes = [
    {
        name: 'home',
        path: '/',
        view: () => <p>The world never says hello back..</p>,
    },
    {
        name: 'user',
        path: '/user/:id',
        view: React.lazy(() => import('./Pages/User.tsx')),
    },
    {
        name: 'notFound',
        path: '/404',
        view: React.lazy(() => import('./Pages/NotFound.tsx')),
    },
]

ReactDOM.render(
    <oatmilk.RouterProvider routes={routes}>
        <App />
    </oatmilk.RouterProvider>,
    document.getElementById('root'),
)
```

### Render a RouterView

The `RouterView` will render the current route's `view`

```js App.tsx
function App() {
    return (
        <>
            <Navigation />
            <Header />
            <oatmilk.RouterView />
            <Footer />
        </>
    )
}
```

### Render some links

No need to generate the paths here, oatmilk will find the route and generate a path for you that is derived from the state.

```js App.tsx
function Navigation() {
    return (
        <>
            <oatmilk.Link routeName='home'>Go home</oatmilk.Link>
            <oatmilk.Link routeName='home' state={{ user: 'bitttttten' }}>
                Go to my page
            </oatmilk.Link>
        </>
    )
}
```

## Decoupled

oatmilk is state first, and everything else is derived from this. The current route is held in state and effects like updating the URL, are managed after the fact.

Decoupling your state and data fetching from your view helps you keep a declarative approach to your codebase. It also makes reasoning and testing simplier, and greatly reduces the complexity of server rendering and pre-fetching data.

## Credits

Thanks to [probablyup](https://github.com/probablyup)'s [buttermilk](https://github.com/probablyup/buttermilk), which was a project I found after writing the first draft of oatmilk which heavily inspired a lot of changes and inspiration.. and of course the name.
