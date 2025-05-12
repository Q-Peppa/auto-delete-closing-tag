const vscode = require("vscode");

/**
 *
 * @param {vscode.TextDocument} document
 * @returns {boolean}
 */
function isTargetDocument(document) {
  const targetLanguages = ["html", "javascriptreact", "typescriptreact"];
  return targetLanguages.includes(document.languageId);
}
/**
 *
 * @param {vscode.TextDocument} document
 * @param {vscode.Position} position
 * @returns {string}
 */
function isInsidePlaceholder(document, position) {
  const line = document.lineAt(position.line).text;
  const cursorPos = position.character;
  // cursor	in <div $1></div>
  if (line.at(cursorPos) === "/" && line.at(cursorPos + 1) === ">") {
    // <p><div class='' id='' attr='' $1></p> get tagName = div
    const reg = new RegExp("<(.*?) .*?/>");
    const match = line.match(reg);
		if (!match) return '';
		return match?.at(1)
  }

  return '';
}
/**
 * @description 一直删除到匹配的 closing tag 末尾
 * @param {vscode.TextEditor} editor
 * @param {vscode.Position} position
 * @param {string} tagName
 * @returns {void}
 */
function deleteClosingTag(editor, position, tagName) {
 
  const document = editor.document;


  const target = "</" + tagName + ">";
  const fullText = editor.document.getText();
  const startOffset = document.offsetAt(position);
  const foundIndex = fullText.indexOf(target, startOffset);
  if (foundIndex === -1) return null;
  const startPos = document.positionAt(foundIndex);
  const endPos = document.positionAt(foundIndex + target.length);
 	const edit = new vscode.WorkspaceEdit();
  edit.delete(editor.document.uri, new vscode.Range(position.with({ character: position.character + 2}), endPos));
  vscode.workspace.applyEdit(edit)
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let tagName = undefined;
  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isTargetDocument(editor.document)) return;
    const change = event.contentChanges[0];
    if (!change || change.text !== "/") return;
    tagName = undefined;
    const position = change.range.end;
		tagName = isInsidePlaceholder(editor.document, position)
    if (tagName.length > 0 ) {
     	deleteClosingTag(editor, position, tagName);
    }
  });
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
