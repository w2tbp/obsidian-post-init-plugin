import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import dayjs from 'dayjs';

interface PluginSettings {
	pattern: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	pattern: 
`---
title: 
date: {{date:YYYY-MM-DD HH:mm:ss}}
categories:
    - 
tags:
    - 
---

`
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'post-init',
			name: 'Post Init Command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const regex = /{{(.*?)}}/g;

				const replaced = this.settings.pattern.replace(regex, (match, content) => {
					const idx = content.indexOf(':');
					if (idx === -1) return match;
					const prefix = content.slice(0, idx);
					const cmd = content.slice(idx + 1);

					if (prefix === 'date') {
						return formatDateTime(new Date(), cmd);
					}

					return match;
				});

				editor.replaceSelection(replaced);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
		.setName('初始化模版')
		.setDesc('可通过命令插入的文本')
		.addTextArea(text => text
			.setPlaceholder('请输入')
			.setValue(this.plugin.settings.pattern)
			.onChange(async (value) => {
				this.plugin.settings.pattern = value;
				await this.plugin.saveSettings();
			}));
	}
}

function formatDateTime(time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') {
	return dayjs(time).format(format);
}
