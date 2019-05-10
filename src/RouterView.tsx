import React from 'react'
import { useOatmilk } from './hooks'

export function RouterView() {
    const { route } = useOatmilk()

    if (!route || !route.view) {
        return null
    }

    return <route.view />
}
