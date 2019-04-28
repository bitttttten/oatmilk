# Transition Hooks

oatmilk has 2 transition hooks: onEnter, and onBeforeEnter. You can use it for the global routing context, and also for a single route's context.

## example

```js routes.tsx
import { IRoute } from 'oatmilk'

export const routes: IRoutes = [
    {
        name: 'home',
        path: '/',
        view: () => <p>The world never says hello back..</p>,
        onEnter: (route, state) => {
            console.log('I am called as you enter only the home route')
        },
        onExit: (route, state) => {
            console.log('I am called as you exit only the home route')
        },
    },
]

function onEnter(route, state) {
    console.log('I am called as you enter any route')
    // analytics.logPageView()
}

function onExit(route, state) {
    console.log('I am called as you exit any route')
}

ReactDOM.render(
    <oatmilk.RouterProvider routes={routes} onEnter={onEnter} onExit={onExit}>
        <App />
    </oatmilk.RouterProvider>,
    document.getElementById('root'),
)
```
