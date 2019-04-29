import UrlPattern from 'url-pattern'
import { IRoute, TRouteState, TRouteName, TURL, TRoutePath } from './types'

export function getRouteFromUrl(routes: IRoute[], url: TURL) {
    return (
        routes.find(({ path }) => new UrlPattern(path).match(url)) ||
        getRouteByName(routes, 'notFound')
    )
}
export function getRouteByName(routes: IRoute[], routeName: TRouteName) {
    return routes.find(({ name }) => name === routeName)
}

export function getStateFromUrl(path: TRoutePath, url: TURL) {
    return new UrlPattern(path).match(url)
}

export function deriveUrlFromPathAndState(
    path: TRoutePath,
    state: TRouteState,
) {
    return new UrlPattern(path).stringify(state)
}

function getRouteAndStateFromUrl(routes: IRoute[], url: TURL) {
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

export function getMatchWithReducerFromUrl(hookReducer: any) {
    return function getMatchFromUrl(
        routes: IRoute[],
        url: TURL,
    ): Promise<void> {
        const { route, state } = getRouteAndStateFromUrl(routes, url)
        return hookReducer(route, state)
    }
}
