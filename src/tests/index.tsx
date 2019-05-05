import 'jest-dom/extend-expect'
import React from 'react'
import { cleanup, render, fireEvent } from 'react-testing-library'
import { Provider, Link } from '../index'
import { IRoute } from '../types'
import { RouterView } from '../RouterView';

afterEach(cleanup)

const routes: IRoute[] = [
    {
        name: 'home',
        path: '/',
        view: () => <p>this is the homepage</p>,
    },
    {
        name: 'user',
        path: '/user/:id',
        view: () => <p>this is the user page</p>,
    },
    {
        name: 'notFound',
        path: '/404',
        view: () => <p>404</p>,
    },
]

describe('<Link>', () => {
    test('renders link text content and attributes correctly', () => {
        const { getByText } = render(
            <Provider
				url="/"
                routes={routes}
            >
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ user: 'bitttttten' }}>link to bitttttten</Link>
                <Link routeName='notFound'>link to 404</Link>
            </Provider>,
        )
        expect(getByText(/link to home/)).toBeTruthy()
        expect(getByText(/link to bitttttten/).getAttribute('href')).toBe('/user/bitttttten')
        expect(getByText(/link to 404/)).toBeTruthy()
	})
    test('navigates from one view to another', () => {
        const { getByText } = render(
            <Provider
				url="/"
                routes={routes}
            >
				<RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ user: 'bitttttten' }}>link to bitttttten</Link>
            </Provider>,
        )
        expect(getByText(/this is the homepage/)).toBeTruthy()
		fireEvent.click(getByText(/link to bitttttten/))
        expect(getByText(/this is the user page/)).toBeTruthy()
		fireEvent.click(getByText(/link to home/))
        expect(getByText(/this is the homepage/)).toBeTruthy()
    })
	test('throws error with an invalid route', () => {
		expect(() => {
			render(
				<Provider
					url="/"
					routes={routes}
				>
					<Link routeName='url-that-is-not-listed'>broken link</Link>
				</Provider>,
			)
		}).toThrow()
	})
})