import { createContext, useMemo, useCallback, useState, useEffect } from 'react'
import { IContext, IProvider, TRouteName, TRouteState, IRoute } from './types'
import {
    getRouteFromUrl,
    getStateFromUrl,
    getRouteByName,
    deriveUrlFromPathAndState,
} from './utils'

const SERVER = typeof window === 'undefined'

const Context = createContext<IContext>(null!)

function Provider({
    children,
    routes,
    url = window.location.pathname,
    onBeforeExit,
	onEnter,
}: IProvider) {
    if (!url && SERVER) {
        throw new Error('You must pass a URL when rendering on the server.')
    }

    const [route, setRoute] = useState<IRoute>(
        () => getRouteFromUrl(routes, url)!,
    )

    const [state, setState] = useState<TRouteState>(() =>
        getStateFromUrl(route.path, url),
    )

    const goTo = useCallback(
        async (toRouteName: TRouteName, toState: TRouteState = {}) => {
            const toRoute = getRouteByName(routes, toRouteName)

            if (!toRoute) {
                throw new Error(`Route ${toRouteName} does not exist`)
            }

            await Promise.all([
                route.onBeforeExit && route.onBeforeExit(route, state),
                onBeforeExit && onBeforeExit(route, state),
            ])

            setRoute(toRoute)
            setState(toState)

            if (onEnter) {
                onEnter(toRoute, toState)
            }
            if (route.onEnter) {
                route.onEnter(route, state)
            }
        },
        [routes],
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

        function onUserNavigating({ state: historyState }: PopStateEvent) {
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

    return <Context.Provider value={value}>{children}</Context.Provider>
}

export { Provider, Context }
