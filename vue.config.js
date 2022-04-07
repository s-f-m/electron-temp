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
