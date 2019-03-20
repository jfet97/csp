module.exports = {
    title: '@jfet/csp',
    description: 'A js library for Communicating Sequential Processes',
    base: '/jfet-csp/',
    themeConfig: {
        nav: [
            {
                text: 'Home',
                link: '/',
            },
            {
                text: 'Guide',
                link: '/guide/',
            },
            {
                text: 'GitHub',
                link: 'https://github.com/jfet97/jfet-csp',
            }
        ],
        sidebar: [
            {
                title: 'Guide',
                collapsable: false,
                children: [
                    '/guide/',
                    '/guide/channels',
                    '/guide/operators',
                ]
            },
        ],
        sidebarDepth: 2,
    }
}

// {
//     '/guide/': [
//         'introduction',
//         'operators',
//     ]
// }

