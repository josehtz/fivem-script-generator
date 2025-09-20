import { mkdir, writeFile, exists } from 'node:fs/promises';
import { join } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { templates } from './templates/index.js';

const rl = createInterface({
    input: stdin,
    output: stdout,
});

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

console.log(`
Fivem Resource Creator
============================
`);

class FiveMScriptGenerator {
    constructor() {
        this.scriptData = {};
        this.outputPath = process.cwd();
    }

    async init() {
        try {
            await this.collectUserInput();
            await this.generateScript();
            this.showSuccess();
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async collectUserInput() {
        console.log('Script Configuration:\n');

        this.scriptData.scriptName = await prompt('Script Name: ');
        if (!this.scriptData.scriptName) {
            throw new Error('El nombre del script es obligatorio');
        }

        this.scriptData.author = await prompt('autor: ');
        this.scriptData.description = await prompt('description: ') || 'fivem script';
        this.scriptData.version = await prompt('version: ') || '1.0.0';

        console.log('\nSelect the files to create:');
        this.scriptData.includeClient = await this.askYesNo('include Client Side? (Y/n): ', true);
        this.scriptData.includeServer = await this.askYesNo('include Server Side? (Y/n): ', true);
        this.scriptData.includeShared = await this.askYesNo('include Shared? (Y/n): ', true);
        this.scriptData.includeConfig = await this.askYesNo('include Config? (Y/n): ', true);

        console.log('\nAdvanced configuration:');
        this.scriptData.createSubfolders = await this.askYesNo('Create organized subfolders? (Y/n): ', true);
        this.scriptData.includeExamples = await this.askYesNo('Include example code? (Y/n): ', true);

    }

    async askYesNo(question, defaultValue = true) {
        const answer = await prompt(question);
        if (!answer) return defaultValue;
        return answer.toLowerCase().startsWith('y') || answer.toLowerCase().startsWith('s');
    }

    async generateScript() {
        const scriptPath = join(this.outputPath, this.scriptData.scriptName);
        
        console.log(`\n🔨 Generando script en: ${scriptPath}`);

        await this.createDirectory(scriptPath);

        await this.generateFxManifest(scriptPath);

        if (this.scriptData.includeClient) {
            await this.generateClientFiles(scriptPath);
        }

        if (this.scriptData.includeServer) {
            await this.generateServerFiles(scriptPath);
        }

        if (this.scriptData.includeShared) {
            await this.generateSharedFiles(scriptPath);
        }

        if (this.scriptData.includeConfig) {
            await this.generateConfigFiles(scriptPath);
        }
    }

    async createDirectory(path) {
        if (!(await exists(path))) {
            await mkdir(path, { recursive: true });
            console.log(`Created Folder: ${path}`);
        }
    }

    async writeFileWithLog(filePath, content) {
        await writeFile(filePath, content, 'utf8');
        console.log(`Created File: ${filePath}`);
    }

    async generateFxManifest(basePath) {
        const content = templates.fxmanifest(this.scriptData);
        await this.writeFileWithLog(join(basePath, 'fxmanifest.lua'), content);
    }

    async generateClientFiles(basePath) {
        const clientPath = join(basePath, 'client');
        await this.createDirectory(clientPath);

        const mainContent = templates.client.main(this.scriptData);
        await this.writeFileWithLog(join(clientPath, 'main.lua'), mainContent);

        if (this.scriptData.includeExamples) {
            const eventsContent = templates.client.events(this.scriptData);
            await this.writeFileWithLog(join(clientPath, 'events.lua'), eventsContent);

            const uiContent = templates.client.ui(this.scriptData);
            await this.writeFileWithLog(join(clientPath, 'ui.lua'), uiContent);
        }
    }

    async generateServerFiles(basePath) {
        const serverPath = join(basePath, 'server');
        await this.createDirectory(serverPath);

        const mainContent = templates.server.main(this.scriptData);
        await this.writeFileWithLog(join(serverPath, 'main.lua'), mainContent);

        if (this.scriptData.includeExamples) {
            const eventsContent = templates.server.events(this.scriptData);
            await this.writeFileWithLog(join(serverPath, 'events.lua'), eventsContent);

            const databaseContent = templates.server.database(this.scriptData);
            await this.writeFileWithLog(join(serverPath, 'database.lua'), databaseContent);
        }
    }

    async generateSharedFiles(basePath) {
        const sharedPath = join(basePath, 'shared');
        await this.createDirectory(sharedPath);

        const mainContent = templates.shared.main(this.scriptData);
        await this.writeFileWithLog(join(sharedPath, 'main.lua'), mainContent);

        const utilsContent = templates.shared.utils(this.scriptData);
        await this.writeFileWithLog(join(sharedPath, 'utils.lua'), utilsContent);
    }

    async generateConfigFiles(basePath) {
        const configPath = join(basePath, 'config');
        await this.createDirectory(configPath);

        const mainContent = templates.config.main(this.scriptData);
        await this.writeFileWithLog(join(configPath, 'config.lua'), mainContent);

        const localesContent = templates.config.locales(this.scriptData);
        await this.writeFileWithLog(join(configPath, 'locales.lua'), localesContent);
    }

    showSuccess() {
        console.log(`
SCRIPT SUCCESSFULLY GENERATED!
================================

Location: ${join(this.outputPath, this.scriptData.scriptName)}
Files Created: 
${this.scriptData.includeClient ? '   Client Side (client/)' : ''}
${this.scriptData.includeServer ? '   Server Side (server/)' : ''}
${this.scriptData.includeShared ? '   Shared (shared/)' : ''}
${this.scriptData.includeConfig ? '   Config (config/)' : ''}
 fxmanifest.lua


To use your script:

1. Copy the ${this.scriptData.scriptName} folder to your resources folder
2. Add ensure ${this.scriptData.scriptName} to your server.cfg
3. Restart the server

Ready to start developing!
        `);
        
        rl.close();
    }
}

const generator = new FiveMScriptGenerator();
await generator.init();