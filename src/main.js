// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code belo
const vscode = require('vscode');
const { DoAPI } = require('./api.cjs');

const sleep = timeMs => new Promise(resolve => {
	setTimeout(resolve, timeMs);
})

class DoManager {
	constructor() {
		this.updateSettings = this.updateSettings.bind(this);
		this.checkSettings = this.checkSettings.bind(this);
		this.create = this.create.bind(this);
		this.destroy = this.destroy.bind(this);
		this.refresh = this.refresh.bind(this);

		this.droplet_list = [];

		this.updateSettings();
		this.api = new DoAPI(this.endpoint, this.token);
		this.checkSettings();
	}
	updateSettings() {
		this.token = vscode.workspace.getConfiguration().get("conf.api.token");
		this.endpoint = vscode.workspace.getConfiguration().get("conf.api.apiEndpoint");
	}
	checkSettings() {
		if (!this.token || (this.token && this.token.length === 0)) {
			vscode.window.showErrorMessage(`Digital Ocean Manager: Setup your token first!`);
			this.api = null;
		}
		if (!this.endpoint || (this.endpoint && this.endpoint.length === 0)) {
			vscode.window.showErrorMessage(`Digital Ocean Manager: Setup your api endpoint first!`);
			this.api = null;
		}
	}
	refresh() {
		return new Promise(resolve => {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Refreshing Droplet List`,
				cancellable: false
			}, async progress => {
				progress.report({ increment: 50, message: "Refreshing..." });
				const resp = await doManager.api.request("/", "GET");
				const droplets = resp.data.droplets;
				if (!droplets) {
					this.droplet_list = [];
					return this.droplet_list;
				}
				this.droplet_list = droplets.map(droplet => new DropletItem(droplet));
				return resolve(this.droplet_list);
			});
		});
	}
	async create() {
		this.updateSettings();
		this.checkSettings();
		if (!this.api) return;
		const templates = vscode.workspace.getConfiguration().get("conf.dropletTemplate");
		console.log(`templates: ${templates}`)
		console.log(templates);
		if (templates.length === 0) {
			vscode.window.showWarningMessage('No template found! Setup your template in your settings.');
			return;
		}
		const selectedValue = await vscode.window.showQuickPick(templates.map(t => `${t.name} ${t.size_slug}(${t.region})`), { placeHolder: 'Select a template to create a droplet' });
		if (!selectedValue) return;
		const selectedName = selectedValue.split(" ")[0];
		const selectedTemplate = templates.filter(t => t.name == selectedName)[0];
		const inputName = await vscode.window.showInputBox({
			value: selectedName,
			placeHolder: "droplet name",
			title: "Input new droplet name"
		});
		if (this.droplet_list.filter(d => d.name === inputName).length > 0) {
			vscode.window.showErrorMessage(`Name ${inputName} exists in your droplets now!`);
			return;
		}
		console.log(selectedTemplate, inputName);
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `Creating ${selectedValue}`,
			cancellable: false
		}, async progress => {
			progress.report({ increment: 50, message: "Creating..." });
			const resp = await this.api.request("/", "POST", selectedTemplate);
			console.log(resp);
			await this.refresh();
			vscode.window.showInformationMessage(`Create done! Your droplet was created at: ${resp.ip_address}`);
		});
	}
	async destroy(name, destroyAll) {
		this.updateSettings();
		this.checkSettings();
		if (!this.api) return;
		let selectedName = null;
		if (!destroyAll) {
			if (this.droplet_list.length === 0) {
				vscode.window.showInformationMessage(`You have no droplet to destroy.`);
				return;
			}
			if (this.droplet_list.length > 1) {
				const selectedValue = await vscode.window.showQuickPick(this.droplet_list.map(droplet => `${droplet.name} ${droplet.size_slug}(${droplet.region})`), { placeHolder: 'Select a droplet to destroy' });
				if (!selectedValue) return;
				selectedName = selectedValue.split(" ")[0];
			}
		} else {
			const selectedChoice = await vscode.window.showQuickPick(["Yes", "Cancel"], { placeHolder: "Will destroy all droplets! Continue?" });
			if (selectedChoice !== "Yes") return;
		}
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `Destroying ${selectedName}`,
			cancellable: false
		}, async progress => {
			progress.report({ increment: 50, message: "Destroying..." });
			const resp = await this.api.request(selectedName ? `/?name=${selectedName}` : "/", "DELETE");
			console.log(resp);
			progress.report({ increment: 40, message: "Refresh droplet list..." });
			await this.refresh();
			vscode.window.showInformationMessage(`Destroy done!`);
		});
	}
}

class DropletItem extends vscode.TreeItem {
	constructor(droplet) {
		super(droplet.name, vscode.TreeItemCollapsibleState.Expanded);
		this.droplet = droplet;
		this.tooltip = `${droplet.id}`;
		this.description = `${droplet.size_slug}(${droplet.region.slug})`;
		this.contextValue = 'DropletItem'
	}
}

class DropletContentItem extends vscode.TreeItem {
	constructor(droplet, key, value) {
		super(key, vscode.TreeItemCollapsibleState.None);
		this.key = key;
		this.droplet = droplet;
		this.tooltip = `${value}`;
		this.description = `${value}`;
		this.contextValue = 'DropletContentItem'
		this.command = {
			arguments: [this.droplet, this.key],
			command: "digital-ocean-manager.dropletCopyIP",
			title: "Copy",
			tooltip: "Copy this value"
		}
	}
}

const doManager = new DoManager();

class DropletListProvider {
	constructor() {
		console.log('new DropletListProvider!');
		this.supportKeys = [
			'id', 'ip_address', 'name', 'size_slug', 'created_at', 'status'
		];
	}
	async refresh() {
		console.log("onRefresh");
		return await doManager.refresh();
	}
	getTreeItem(element) {
		return element;
	}
	getChildren(element) {
		if (!element) {
			return this.refresh();
		} else {
			return Promise.resolve(Object.keys(element.droplet)
				.filter(key => this.supportKeys.find(k => key === k) !== undefined)
				.map(key => {
					return new DropletContentItem(element.droplet, key, element.droplet[key]);
				}));
		}
	}
}

async function copyToClipboard(value) {
	await vscode.env.clipboard.writeText(`${value}`);
	vscode.window.showInformationMessage(`Copied "${value}" to you clipboard.`)
}

async function dropletCopyIP(droplet, key) {
	if (droplet) {
		if (key === 'ip_address' && !droplet['ip_address']) return;
		copyToClipboard(key && droplet[key] !== undefined ? droplet[key] : droplet.ip_address);
	} else {
		const selectedValue = await vscode.window.showQuickPick(doManager.droplet_list.map(droplet => `${droplet.label} ${droplet.description}`), { placeHolder: 'Select a droplet' });
		if (!selectedValue) return;
		const selectedName = selectedValue.split(" ")[0];
		const dropletTarget = doManager.droplet_list.filter(d => d.label === selectedName)[0];
		copyToClipboard(dropletTarget.droplet.ip_address);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("digital-ocean-manager started!");
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletCreate', doManager.create));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletDestroy', doManager.destroy));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletRefresh', doManager.refresh));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletCopyIP', dropletCopyIP));

	vscode.window.registerTreeDataProvider('dropletList', new DropletListProvider());
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
