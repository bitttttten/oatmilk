import { useContext } from 'react'
import { Context } from './Router'

export function useOatmilk() {
    return useContext(Context)
}
