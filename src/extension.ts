'use strict';
// The module 'vscode' contains the VS Code extensibility API Import the module
// and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import {readFile, writeFile} from './fsUtils';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import {compact, startsWith, sortBy} from 'lodash';

import {QuickPickItem, ViewColumn} from 'vscode';

const REACT_STATELESS_COMPONENT_TEMPLATE = 'ReactStatelessComponent.template';
const REACT_REDUX_COMPONENT_TEMPLATE = 'ReactReduxComponent.template';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.format = function() {
    var a = this;
    for (var k in arguments) {
        a = a.replaceAll("{" + k + "}", arguments[k]);
    }
    return a;
};

async function populateReactComponentTemplate(templateName:string, pathToStore:string, filename:string){
    try{
        console.log(__dirname)
        const content = await readFile(__dirname+'/templates/'+templateName);
        const fileContent = String(content);

        // get contents of file 
        const fileContentFormatted:string = fileContent.format([filename]);

        // write file
        const writeStatus = await writeFile(pathToStore, fileContentFormatted); 

    }catch(err){
        console.log(err);
    }
}

function isFolderDescriptor(filepath : string) : boolean {
    return filepath.charAt(filepath.length - 1) === path.sep;
}

export async function openFile(absolutePath : string) : Promise < void > {
    if(isFolderDescriptor(absolutePath)) {
        const showInformationMessages = vscode
            .workspace
            .getConfiguration('advancedNewFile')
            .get('showInformationMessages', true);

        if (showInformationMessages) {
            vscode
                .window
                .showInformationMessage(`Folder created: ${absolutePath}`);
        }
    } else {
        const textDocument = await vscode
            .workspace
            .openTextDocument(absolutePath);

        if (textDocument) {
            vscode
                .window
                .showTextDocument(textDocument, ViewColumn.Active);
        }
    }
}

export function createFileOrFolder(absolutePath : string) : void {
    let directoryToFile = path.dirname(absolutePath);

    if (!fs.existsSync(absolutePath)) {
        if (isFolderDescriptor(absolutePath)) {
            mkdirp.sync(absolutePath);
        } else {
            mkdirp.sync(directoryToFile);
            fs.appendFileSync(absolutePath, '');
        }
    }
}

export async function showInputBox(baseDirectory : String) : Promise < string > {
    try {
        const input = await vscode
            .window
            .showInputBox({prompt: `Enter name of React Compoent to be added under: ${baseDirectory}`, placeHolder: 'Filename or relative path to file'});

        return input;
    } catch (e) {
        return;
    }
}

const createReduxConnectedReactComponent = async (file) => {
    const { directoryToCreate, newFileInput } = await createBasicReactComponentDirectory(file);

    // create actions / reducers / selectors files 

    // create actions
    const actionsJS = path.join(directoryToCreate, "actions.js");
    createFileOrFolder(actionsJS);

    // create reducers
    const reducersJS = path.join(directoryToCreate, "reducers.js");
    createFileOrFolder(reducersJS);

    // create selectors
    const selectorsJS = path.join(directoryToCreate, "selectors.js");
    createFileOrFolder(selectorsJS);

    // create React Component js file with connect method
    const reactComponentJS = path.join(directoryToCreate, newFileInput + ".js");
    createFileOrFolder(reactComponentJS);

    await populateReactComponentTemplate(REACT_REDUX_COMPONENT_TEMPLATE, reactComponentJS, newFileInput);

    await openFile(reactComponentJS);
};

const createBasicReactComponent = async (file) => {
    const { directoryToCreate, newFileInput } = await createBasicReactComponentDirectory(file);

    // create React Component js
    const reactComponentJS = path.join(directoryToCreate, newFileInput + ".js");
    createFileOrFolder(reactComponentJS);

    await populateReactComponentTemplate(REACT_STATELESS_COMPONENT_TEMPLATE, reactComponentJS, newFileInput);

    await openFile(reactComponentJS);
};

const createBasicReactComponentDirectory = async (file) => {
    // The code you place here will be executed every time your command is executed
    console.log('createBasicReactComponent: file', file);
    // Display a message box to the user
    vscode
        .window
        .showInformationMessage('createBasicReactComponent!');

    const dir = file.fsPath;

    const newFileInput = await showInputBox(dir);
    if (!newFileInput){
        return;
    } 
    
    // create directory for React Component
    const directoryToCreate = path.join(dir, newFileInput).concat('/');
    createFileOrFolder(directoryToCreate);

    // create React Component css
    const reactComponentCSS = path.join(directoryToCreate, newFileInput + ".css");
    createFileOrFolder(reactComponentCSS);

    return {directoryToCreate, newFileInput};
};


// this method is called when your extension is activated your extension is
// activated the very first time the command is executed
export function activate(context : vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors
    // (console.error) This line of code will only be executed once when your
    // extension is activated
    console.log('Congratulations, your extension "react-explorer-addons" is now active!');

    // The command has been defined in the package.json file Now provide the
    // implementation of the command with  registerCommand The commandId parameter
    // must match the command field in package.json
    let createBasicReactComponentDisposable = vscode
        .commands
        .registerCommand('extension.createBasicReactComponent', createBasicReactComponent);

    context
        .subscriptions
        .push(createBasicReactComponentDisposable);

    let createReduxConnectedReactComponentDisposable = vscode
        .commands
        .registerCommand('extension.createReduxConnectedReactComponent', createReduxConnectedReactComponent);

    context
        .subscriptions
        .push(createReduxConnectedReactComponentDisposable);

}

// this method is called when your extension is deactivated
export function deactivate() {}
