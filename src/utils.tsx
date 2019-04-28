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
