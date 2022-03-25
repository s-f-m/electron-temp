module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            mainProcessWatch: ["src/**/*.js"],
            builderOptions: {
                extraResources: [
                        {
                            from: "static",
                            to: "static/",
                            filter: ["**/*"]
                        }
                    ],
                publish: {
                    provider: 'generic',
                    url: 'http://localhost:9090/test/electron/'
                },
                win:{
                    requestedExecutionLevel:"requireAdministrator",
                    extraResources: [
                        {
                            from: ".\\node_modules\\node-adodb\\lib\\adodb.js",
                            to: "adodb.js"
                        }
                    ]
                },
                nsis:{
                    oneClick : false,
                    allowElevation:false,
                    allowToChangeInstallationDirectory:true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    perMachine: true,
                    include: './public/installer.nsh'
                }
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    }

}
