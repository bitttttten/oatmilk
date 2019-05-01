import UrlPattern from 'url-pattern'
import { IRoute, TRouteState, TRouteName, TURL, TRoutePath } from './types'

export function getRouteFromUrl<T>(routes: IRoute<T>[], url: TURL) {
    return (
        routes.find(({ path }) => new UrlPattern(path).match(url)) ||
        getRouteByName(routes, 'notFound')
    )
}
export function getRouteByName<T>(routes: IRoute<T>[], routeName: TRouteName) {
    return routes.find(({ name }) => name === routeName)
}

export function getStateFromUrl(path: TRoutePath, url: TURL): TRouteState {
    return new UrlPattern(path).match(url)
}

export function deriveUrlFromPathAndState(
    path: TRoutePath,
    state: TRouteState,
) {
    return new UrlPattern(path).stringify(state)
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
    hookCallee: (route: IRoute, state: TRouteState) => (hook: any) => Promise<any>,
    routes: IRoute[],
    url: TURL,
) {
    const { route, state } = getRouteAndStateFromUrl(routes, url)
    const callback = hookCallee(route, state)
    return callback
}
