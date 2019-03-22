module.exports = {
    title: '@jfet97/csp',
    description: 'A js library for Communicating Sequential Processes',
    base: '/@jfet97-csp/',
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
                link: 'https://github.com/@jfet97/csp',
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

