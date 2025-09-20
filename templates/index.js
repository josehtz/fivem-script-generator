export const templates = {
    fxmanifest: (data) => {
        return `fx_version 'cerulean'
game 'gta5'

name '${data.scriptName}'
author '${data.author}'
description '${data.description}'
version '${data.version}'

${data.includeShared ? `shared_scripts {\n    'shared/*.lua'\n}\n\n` : ''}${data.includeClient ? `client_scripts {\n    'client/*.lua'\n}\n\n` : ''}${data.includeServer ? `server_scripts {\n    'server/*.lua'\n}` : ''}`;
    },
    client: {
        main: (data) => `-- ${data.scriptName}
`,
        events: (data) => `-- ${data.scriptName}
`,
        ui: (data) => `-- ${data.scriptName}
`
    },
    server: {
        main: (data) => `-- ${data.scriptName}
`,
        events: (data) => `-- ${data.scriptName}
`,
        database: (data) => `-- ${data.scriptName}
`
    },
    shared: {
        main: (data) => `-- ${data.scriptName}

`,
        utils: (data) => `-- ${data.scriptName}
`
    },
    config: {
        main: (data) => `-- ${data.scriptName}
`,
        locales: (data) => `-- ${data.scriptName}
`
    },
};