import { useOatmilk, TRouteState, TRouteName, TQuery } from './index'

export default function Redirect({
    routeName,
    state = {},
    toQuery = {},
    withPrefix,
}: {
    routeName: TRouteName
    state: TRouteState
    toQuery: TQuery
    withPrefix?: string
}) {
    const { goTo } = useOatmilk()
    goTo(routeName, state, toQuery, withPrefix)
    return null
}
