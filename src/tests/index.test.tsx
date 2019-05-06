import 'jest-dom/extend-expect'
import React from 'react'
import {
    cleanup,
    render,
    fireEvent,
    waitForElement,
} from 'react-testing-library'
import { act } from 'react-dom/test-utils'
import { Provider, Link } from '../index'
import { IRoute } from '../types'
import { RouterView } from '../RouterView'
import { getRouteFromUrl, getRouteByName, getStateFromUrl } from '../utils'

afterEach(cleanup)

const homeRoute: IRoute = {
    name: 'home',
    path: '/',
    view: () => <p>this is the homepage</p>,
}

const userRoute: IRoute = {
    name: 'user',
    path: '/user/:id',
    view: () => <p>this is the user page</p>,
}

const notFoundRoute: IRoute = {
    name: 'notFound',
    path: '/404',
    view: () => <p>404</p>,
}

const routes: IRoute[] = [homeRoute, userRoute, notFoundRoute]

describe('<Link>', () => {
    test('renders link text content and attributes correctly', () => {
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
                <Link routeName='notFound'>link to 404</Link>
            </Provider>,
        )
        expect(getByText(/link to home/)).toBeTruthy()
        expect(getByText(/link to bitttttten/).getAttribute('href')).toBe(
            '/user/bitttttten',
        )
        expect(getByText(/link to 404/)).toBeTruthy()
    })
    test('navigates from one view to another', async () => {
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
            </Provider>,
        )
        expect(getByText(/this is the homepage/)).toBeTruthy()
        act(() => {
            fireEvent.click(getByText(/link to bitttttten/))
        })
        await waitForElement(() => getByText(/this is the user page/))
        act(() => {
            fireEvent.click(getByText(/link to home/))
        })
        await waitForElement(() => getByText(/this is the homepage/))
    })
    test('throws error with an invalid route', () => {
        expect(() => {
            render(
                <Provider url='/' routes={routes}>
                    <Link routeName='url-that-is-not-present'>broken link</Link>
                </Provider>,
            )
        }).toThrow()
    })
})

describe('getRouteFromUrl', () => {
    test('finds `home` route from `/`', () => {
        expect(getRouteFromUrl(routes, '/')).toEqual(homeRoute)
    })
    test('finds `notFound` route from `/404`', () => {
        expect(getRouteFromUrl(routes, '/404')).toEqual(notFoundRoute)
    })
    test('returns `notFound` route from `/url-that-is-not-present`', () => {
        expect(getRouteFromUrl(routes, '/url-that-is-not-present')).toEqual(notFoundRoute)
    })
})

describe('getRouteByName', () => {
    test('finds `home` route', () => {
        expect(getRouteByName(routes, 'home')).toEqual(homeRoute)
    })
    test('finds `notFound` route from `/404`', () => {
        expect(getRouteByName(routes, 'notFound')).toEqual(notFoundRoute)
    })
    test('returns undefined from `/url-that-is-not-present`', () => {
        expect(getRouteByName(routes, '/')).toEqual(undefined)
    })
})

describe('getStateFromUrl', () => {
    test('returns empty object for route with no special cases', () => {
        expect(getStateFromUrl('/', '/')).toEqual({})
    })
    test('returns an object with `id` of `bitttttten` in the user route', () => {
        expect(getStateFromUrl('/user/:id', '/user/bitttttten')).toEqual({
            id: 'bitttttten',
        })
    })
})