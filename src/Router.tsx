import { createContext, useMemo, useCallback, useState, useEffect } from 'react'
import {
    IRouterContext,
    PRouterProvider,
    TRouteName,
    TRouteState,
    IRoute,
} from './types'
import {
    getRouteFromUrl,
    getStateFromUrl,
    getRouteByName,
    deriveUrlFromPathAndState,
} from './utils'

const SERVER = typeof window === 'undefined'

const RouterContext = createContext<IRouterContext>(null!)

function RouterProvider({
    children,
    routes,
    url = window.location.pathname,
}: PRouterProvider) {
    if (!url && SERVER) {
        throw new Error('You must pass a URL when rendering on the server.')
    }

    const [route, setRoute] = useState<IRoute>(() =>
        getRouteFromUrl(routes, url),
    )

    const [state, setState] = useState<TRouteState>(() =>
        getStateFromUrl(route.path, url),
    )

    const goTo = useCallback(
        (toRouteName: TRouteName, toState: TRouteState) => {
            console.log(toRouteName, toState)
            const toRoute = getRouteByName(routes, toRouteName)

            if (!toRoute) {
                throw new Error(`Route ${toRouteName} does not exist`)
            }

            setRoute(toRoute)
            setState(toState)
        },
    )

    useEffect(() => {
        if (SERVER) return

        if (route.name === 'notFound') {
            return window.history.replaceState(
                { routeName: route.name },
                '',
                window.location.pathname,
            )
        }

        const url = deriveUrlFromPathAndState(route.path, state)
        if (url !== window.location.pathname) {
            const historyState = { routeName: route.name, state }
            window.history.pushState(historyState, '', url)
        }
    }, [route.name, state])

    useEffect(() => {
        if (SERVER) return

        function onUserNavigating({ state: historyState }) {
            goTo(historyState.routeName, historyState.state)
        }

        window.addEventListener('popstate', onUserNavigating)
        return () => window.removeEventListener('popstate', onUserNavigating)
    }, [])

    const value = useMemo(
        () => ({
            goTo,
            state,
            setState,
            route,
            setRoute,
        }),
        [],
    )

    return (
        <RouterContext.Provider value={value}>
            {children}
        </RouterContext.Provider>
    )
}

export { RouterProvider, RouterContext }
