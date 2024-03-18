import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-bulk-frontmatter-editor',
			name: 'Open Frontmatter Editor',
			callback: () => {
				new FrontmatterEditorModal(this.app).open();
				return true;

			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FrontmatterEditorModal extends Modal {
	constructor(app: App) {
		super(app);
		this.extractFrontmatter();
	}


	extractFrontmatter() {
		const files = this.app.vault.getMarkdownFiles()

		return files.map(file => {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter
			return { file: file.basename, frontmatter }

		})
	}

	generateTemplate() {
		const files = this.extractFrontmatter()
		const template = files.map(file => {
			return `
			<div style='display:flex;align-items:center;margin-bottom:0.5rem'>
				<input style='width:1.5rem;height:1.5rem' type="checkbox" id="${file.file}" name="${file.file}">
				<label for="${file.file}">${file.file}</label>
			</div>
			`

		})

		return template.join('')
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Frontmatter Editor' });
		contentEl.createEl('p', { text: 'Select frontmatter to edit' });
		contentEl.createEl('input', { type: 'text', attr: { placeholder: 'Search' } })

		contentEl.createEl('p', { text: 'Select the files you want to edit' });
		contentEl.createEl('div').innerHTML = this.generateTemplate()
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
