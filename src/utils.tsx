import UrlPattern from 'url-pattern'
import { IRoute, TRouteState, TRouteName, TURL, TRoutePath, TQuery } from './types'

export function getRouteFromUrl<T>(
    routes: IRoute<T>[],
    url: TURL,
    Matcher: any = UrlPattern,
) {
    return (
        routes.find(({ path }) => new Matcher(path).match(url)) ||
        getRouteByName(routes, 'notFound')
    )
}
export function getRouteByName<T>(routes: IRoute<T>[], routeName: TRouteName) {
    return routes.find(({ name }) => name === routeName)
}

export function getStateFromUrl(
    path: TRoutePath,
    url: TURL,
    Matcher: any = UrlPattern,
): TRouteState {
    return new Matcher(path).match(url)
}

export function deriveUrlFromPathAndState(
    path: TRoutePath,
    state: TRouteState,
    Matcher: any = UrlPattern,
) {
    return new Matcher(path).stringify(state)
}

function getRouteAndStateFromUrl<T>(routes: IRoute<T>[], url: TURL) {
    const route = getRouteFromUrl(routes, url)!
    const state = getStateFromUrl(route.path, url)
    return { route, state }
}

export function getMatchFromUrl(routes: IRoute[], url: TURL): Promise<void> {
    const {
        route: { onEnter, ...route },
        state,
    } = getRouteAndStateFromUrl(routes, url)
    return onEnter ? onEnter(route, state) : Promise.resolve()
}

export function getMatchWithCalleeFromUrl(
    hookCallee: (
        route: IRoute,
        state: TRouteState,
    ) => (hook: any) => Promise<any>,
    routes: IRoute[],
    url: TURL,
) {
    const { route, state } = getRouteAndStateFromUrl(routes, url)
    return route.onEnter && hookCallee(route, state)(route.onEnter)
}

export function parseQueryStringIntoObject(qs?: string) {
    if (!qs || typeof qs !== 'string') {
        return {}
    }
    const params: TQuery = {}
    qs.split("&").forEach(segment => {
        const [key,value] = segment.split('=')
        params[key] = value
    })
    return params
}