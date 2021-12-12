// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// const path = require('path');
const vscode = require('vscode');
// import vscode from 'vscode';
const { DoAPI } = require('./api.cjs');
// import DoAPI from './api';

const dropletTemplate = {
	"id": 277449543,
	"name": "test-droplet",
	"memory": 1024,
	"vcpus": 1,
	"disk": 25,
	"region": {
		"name": "Singapore 1",
		"slug": "sgp1",
		"features": [
			"backups",
			"ipv6",
			"metadata",
			"install_agent",
			"storage",
			"image_transfer"
		],
		"available": true,
		"sizes": [
			"s-1vcpu-1gb",
			"s-1vcpu-1gb-amd",
			"s-1vcpu-1gb-intel",
			"s-1vcpu-2gb",
			"s-1vcpu-2gb-amd",
			"s-1vcpu-2gb-intel",
			"s-2vcpu-2gb",
			"s-2vcpu-2gb-amd",
			"s-2vcpu-2gb-intel",
			"s-2vcpu-4gb",
			"s-2vcpu-4gb-amd",
			"s-2vcpu-4gb-intel",
			"s-4vcpu-8gb",
			"c-2",
			"c2-2vcpu-4gb",
			"s-4vcpu-8gb-amd",
			"s-4vcpu-8gb-intel",
			"g-2vcpu-8gb",
			"gd-2vcpu-8gb",
			"s-8vcpu-16gb",
			"m-2vcpu-16gb",
			"c-4",
			"c2-4vcpu-8gb",
			"s-8vcpu-16gb-amd",
			"s-8vcpu-16gb-intel",
			"m3-2vcpu-16gb",
			"g-4vcpu-16gb",
			"so-2vcpu-16gb",
			"m6-2vcpu-16gb",
			"gd-4vcpu-16gb",
			"so1_5-2vcpu-16gb",
			"m-4vcpu-32gb",
			"c-8",
			"c2-8vcpu-16gb",
			"m3-4vcpu-32gb",
			"g-8vcpu-32gb",
			"so-4vcpu-32gb",
			"m6-4vcpu-32gb",
			"gd-8vcpu-32gb",
			"so1_5-4vcpu-32gb",
			"m-8vcpu-64gb",
			"c-16",
			"c2-16vcpu-32gb",
			"m3-8vcpu-64gb",
			"g-16vcpu-64gb",
			"so-8vcpu-64gb",
			"m6-8vcpu-64gb",
			"gd-16vcpu-64gb",
			"so1_5-8vcpu-64gb",
			"m-16vcpu-128gb",
			"c-32",
			"c2-32vcpu-64gb",
			"m3-16vcpu-128gb",
			"m-24vcpu-192gb",
			"g-32vcpu-128gb",
			"so-16vcpu-128gb",
			"m6-16vcpu-128gb",
			"gd-32vcpu-128gb",
			"m3-24vcpu-192gb",
			"g-40vcpu-160gb",
			"so1_5-16vcpu-128gb",
			"gd-40vcpu-160gb",
			"so-24vcpu-192gb",
			"m6-24vcpu-192gb",
			"so1_5-24vcpu-192gb",
			"so-32vcpu-256gb",
			"so1_5-32vcpu-256gb"
		]
	},
	"image": {
		"id": 93525508,
		"name": "20.04 (LTS) x64",
		"distribution": "Ubuntu",
		"slug": "ubuntu-20-04-x64",
		"public": true,
		"regions": [
			"nyc3",
			"nyc1",
			"sfo1",
			"nyc2",
			"ams2",
			"sgp1",
			"lon1",
			"ams3",
			"fra1",
			"tor1",
			"sfo2",
			"blr1",
			"sfo3"
		],
		"created_at": "2021-10-12T21:57:21Z",
		"min_disk_size": 15,
		"type": "base",
		"size_gigabytes": 0.6,
		"description": "Ubuntu 20.04 x86",
		"tags": [],
		"status": "available"
	},
	"size_slug": "s-1vcpu-1gb",
	"locked": false,
	"created_at": "2021-12-11T14:46:14Z",
	"status": "active",
	"networks": {
		"v4": [
			{
				"ip_address": "159.65.132.36",
				"netmask": "255.255.240.0",
				"gateway": "159.65.128.1",
				"type": "public"
			},
			{
				"ip_address": "10.104.0.2",
				"netmask": "255.255.240.0",
				"gateway": "",
				"type": "private"
			}
		],
		"v6": []
	},
	"kernel": null,
	"backup_ids": [],
	"snapshot_ids": [],
	"action_ids": [],
	"features": [
		"droplet_agent",
		"private_networking"
	],
	"ip_address": "159.65.132.36",
	"private_ip_address": "10.104.0.2",
	"ip_v6_address": null,
	"ssh_keys": [],
	"backups": false,
	"ipv6": false,
	"private_networking": true,
	"user_data": null,
	"volumes": [],
	"tags": [],
	"monitoring": null,
	"vpc_uuid": "5b73020f-7351-4b7e-9a87-012a6eacc66e",
	"_last_used": 0,
	"tokens": [
		"*****"
	],
	"end_point": "https://api.digitalocean.com/v2/",
	"next_backup_window": null,
	"volume_ids": [],
	"size": {
		"slug": "s-1vcpu-1gb",
		"memory": 1024,
		"vcpus": 1,
		"disk": 25,
		"transfer": 1.0,
		"price_monthly": 5.0,
		"price_hourly": 0.00744,
		"regions": [
			"ams3",
			"blr1",
			"fra1",
			"lon1",
			"nyc1",
			"nyc3",
			"sfo3",
			"sgp1",
			"tor1"
		],
		"available": true,
		"description": "Basic"
	}
};

const sleep = timeMs => new Promise(resolve => {
	setTimeout(resolve, timeMs);
})

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
class DoManager {
	constructor() {
		this.updateSettings = this.updateSettings.bind(this);
		this.checkSettings = this.checkSettings.bind(this);
		this.create = this.create.bind(this);
		this.destroy = this.destroy.bind(this);
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
	async create() {
		this.updateSettings();
		this.checkSettings();
		if (!this.api) return;
		vscode.window.showInformationMessage('I will create a droplet!');
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
		console.log(selectedTemplate);
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `Creating ${selectedValue}`,
			cancellable: false
		}, async (progress, progressToken) => {
			progress.report({ increment: 0, message: "Waiting for creation..." });
			// const resp = await this.api.request("/", "POST", selectedTemplate);
			await sleep(1000);
			progress.report({ increment: 100, message: "Done!" });
			await sleep(1000);
		});

	}
	async destroy() { }
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
		this.droplet = droplet;
		this.tooltip = `${value}`;
		this.description = `${value}`;
		this.contextValue = 'DropletContentItem'
	}
}

const doManager = new DoManager();

class DropletListProvider {
	constructor(workspaceRoot) {
		this.droplet_list = [
			// new DropletItem(dropletTemplate),
		];
		console.log('new DropletListProvider!');
		this.supportKeys = [
			'id', 'ip_address', 'name', 'size_slug', 'created_at', 'status'
		];
	}
	async refresh() {
		console.log("onRefresh");
		const resp = await doManager.api.request("/", "GET");
		const droplets = resp.data;
		if (!droplets || !(droplets instanceof Array)) {
			this.droplet_list = [];
			return this.droplet_list;
		}
		this.droplet_list = droplets.map(droplet => new DropletItem(droplet));
		return this.droplet_list;
	}
	getTreeItem(element) {
		return element;
	}
	getChildren(element) {
		if (!element) {
			// return Promise.resolve(this.droplet_list);
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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("digital-ocean-manager started!");
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletCreate', doManager.create));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletDestroy', doManager.destroy));

	vscode.window.registerTreeDataProvider('dropletList', new DropletListProvider());
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
