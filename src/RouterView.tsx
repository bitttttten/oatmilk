import { useContext } from 'react'
import { Context } from './Router'

export function RouterView() {
    const { route } = useContext(Context)

    if (!route || !route.view) {
        return null
    }

    return <route.view />
}
