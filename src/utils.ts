import UrlPattern from 'url-pattern'
import {
    IRoute,
    TRouteState,
    TRouteName,
    TURL,
    TRoutePath,
    TQuery,
    IQueryObject,
    THook,
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

function getRouteAndStateFromUrl<T = THook>(routes: IRoute<T>[], url: TURL) {
    const route = getRouteFromUrl<T>(routes, url)!
    const state = getStateFromUrl(route.path, url)
    return { route, state }
}

export function getMatchFromUrl<T = THook>(routes: IRoute<T>[], url: TURL): Promise<void> {
    const {
        route: { onEnter, ...route },
        state,
    } = getRouteAndStateFromUrl<T>(routes, url)
    return onEnter && typeof onEnter === 'function' ? onEnter(route, state) : Promise.resolve()
}

export function getMatchWithCalleeFromUrl<T = THook>(
    hookCallee: (
        route: IRoute<T>,
        state: TRouteState,
    ) => (hook: any) => Promise<any>,
    routes: IRoute<T>[],
    url: TURL,
) {
    const { route, state } = getRouteAndStateFromUrl<T>(routes, url)
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
        .map(key => (queryString[key] ? key + '=' + queryString[key] : key))
        .join('&')}`
}
