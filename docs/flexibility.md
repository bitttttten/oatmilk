# Flexibility

`oatmilk` was written with having a React friendly API.

For example, if you wanted to build your own `RouterView` you can do it really easily. Or if you wanted to change the background colour of your navbar depending on the route, it's quite simple too:

```js Navbar.tsx
import React, { useContext } from 'react'
import { Context as oatmilkContext, TRouteName } from 'oatmilk'

function getColour(routeName: TRouteName) {
    switch (TRouteName) {
        case 'home':
            return 'tomato'
        case 'users':
            return 'redbeccapurple'
        default:
            return 'orange'
    }
}

export default function NavBar() {
    const { route } = useContext(oatmilkContext)

    return (
        <div css={{ backgroundColor: getColour(route ? route.view : '') }}>
            <Link routeName='home'>
                <IconHome /> Home
            </Link>
            <Link routeName='users'>
                <IconUsers /> Users
            </Link>
            <Link routeName='settings'>
                <IconSettings /> Settings
            </Link>
        </div>
    )
}
```
