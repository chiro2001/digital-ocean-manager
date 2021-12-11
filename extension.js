// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("digital-ocean-manager started!");
	class DoManager {
		constructor(options) {

		}
		request() { }
		create() {
			vscode.window.showInformationMessage('I will create a droplet!');
		}
		list() { }
		destroy() { }
	}
	const doManager = new DoManager();
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletCreate', doManager.create));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletList', doManager.list));
	context.subscriptions.push(vscode.commands.registerCommand('digital-ocean-manager.dropletDestroy', doManager.destroy));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
