import React, {
    createContext,
    useMemo,
    useCallback,
    useState,
    useEffect,
} from 'react'
import {
    IContext,
    IProvider,
    TRouteName,
    TRouteState,
    IRoute,
    IData,
} from './types'
import {
    getRouteFromUrl,
    getStateFromUrl,
    getRouteByName,
    deriveUrlFromPathAndState,
} from './utils'

const SERVER = typeof window === 'undefined'

export const Context = createContext<IContext>(null!)

export function Provider({
    children,
    routes,
    url = window.location.pathname,
    onBeforeExit,
    onEnter,
    hookReducer,
}: IProvider) {
    if (!url && SERVER) {
        throw new Error('You must pass a URL when rendering on the server.')
    }

    if (routes.length === 0) {
        throw new Error('You must provide routes')
    }

    const firstRoute = getRouteFromUrl(routes, url)

    const [{ route, state }, setData] = useState<IData>({
        route: firstRoute!,
        state: firstRoute ? getStateFromUrl(firstRoute.path, url) : {},
    })

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

            if (onEnter) {
                onEnter(toRoute, toState)
            }
            if (route.onEnter) {
                const method = hookReducer || route.onEnter
                method(toRoute, toState)
            }

            setData({ route: toRoute, state: toState })
        },
        [],
    )

    const getHref = useCallback(
        (routeName: string, state: TRouteState = {}) => {
            const route = getRouteByName(routes, routeName)
            if (!route) {
                throw new Error(
                    `Failed to generate href: route "${routeName}" does not exist`,
                )
            }
            return deriveUrlFromPathAndState(route.path, state)
        },
        [],
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
        const historyState = { routeName: route.name, state }
        if (url !== window.location.pathname) {
            window.history.pushState(historyState, '', url)
        } else {
            // ensure's that the query params an hash are kept on first page load
            window.history.replaceState(
                historyState,
                '',
                `${url}${window.location.search}${window.location.hash}`,
            )
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
            route,
            getHref,
        }),
        [route.name, state],
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
}
