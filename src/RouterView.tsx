import React, { useContext } from 'react'
import { RouterContext } from './Router'

export default function RouterView() {
    const { route } = useContext(RouterContext)

    if (!route || !route.view) {
        return null
    }

    return <route.view />
}
