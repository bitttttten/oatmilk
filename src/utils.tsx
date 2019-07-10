import UrlPattern from 'url-pattern'
import {
    IRoute,
    TRouteState,
    TRouteName,
    TURL,
    TRoutePath,
    TQuery,
    IQueryObject,
} from './types'

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
    query?: TQuery,
    Matcher: any = UrlPattern,
) {
    const pathname = new Matcher(path).stringify(state)
    const search = parseObjectIntoQueryString(query)
    return `${pathname}${search}`
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

export function parseQueryStringIntoObject(queryString?: string) {
    if (!queryString || typeof queryString !== 'string') {
        return {}
    }
    const params: TQuery = {}
    queryString.split('&').forEach(segment => {
        const [key, value] = segment.split('=')
        params[key] = value
    })
    return params
}

export function parseObjectIntoQueryString(queryString?: IQueryObject) {
    if (
        !queryString ||
        typeof queryString !== 'object' ||
        Object.keys(queryString).length === 0
    ) {
        return ''
    }
    return `?${Object.keys(queryString)
        .map(key => key + '=' + queryString[key])
        .join('&')}`
}
