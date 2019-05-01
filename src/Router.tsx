import React, {
    createContext,
    useMemo,
    useCallback,
    useState,
    useEffect,
    ProviderExoticComponent,
    ProviderProps,
} from 'react'
import {
    IContext,
    IProvider,
    TRouteName,
    TRouteState,
    IData,
    IRoute,
    THook,
    TDefaultHookCallee,
} from './types'
import {
    getRouteFromUrl,
    getStateFromUrl,
    getRouteByName,
    deriveUrlFromPathAndState,
} from './utils'

const SERVER = typeof window === 'undefined'

export const Context = createContext<IContext<THook>>(null!)

function defaultHookCallee(route: IRoute, state: TRouteState) {
    return (hook: THook) => hook(route, state)
}

export function Provider<HookCallee = TDefaultHookCallee, Hook = THook>({
    children,
    routes,
    url = window.location.pathname,
    onBeforeExit,
    onEnter,
    // @ts-ignore
    hookCallee = defaultHookCallee,
}: IProvider<HookCallee, Hook>) {
    if (!url && SERVER) {
        throw new Error('[oatmilk] You must pass a URL when rendering on the server.')
    } else if (SERVER && typeof url !== "string") {
        throw new Error('[oatmilk] You must pass a string as the URL when rendering on the server.')
    }

    if (routes.length === 0) {
        throw new Error('[oatmilk] You must provide routes')
    }

    const firstRoute = getRouteFromUrl<Hook>(routes, url)

    const [{ route, state }, setData] = useState<IData<Hook>>({
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
                // @ts-ignore
                route.onBeforeExit && hookCallee(route, state)(route.onBeforeExit),
                // @ts-ignore
                onBeforeExit && hookCallee(route, state)(onBeforeExit),
            ])

            if (onEnter) {
                // @ts-ignore
                hookCallee(toRoute, toState)(onEnter)
            }
            if (route.onEnter) {
                // @ts-ignore
                hookCallee(toRoute, toState)(route.onEnter)
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

        if (onEnter) {
            // @ts-ignore
            hookCallee(route, state)(onEnter)
        }
        if (route.onEnter) {
            // @ts-ignore
            hookCallee(route, state)(route.onEnter)
        }
    })

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

    const ContextProvider = Context.Provider as ProviderExoticComponent<ProviderProps<IContext<Hook>>>

    return <ContextProvider value={value}>{children}</ContextProvider>
}
