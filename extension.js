const vscode = require("vscode");
/**
 *
 * @param {string} text
 * @param {number} offset
 * @param {string} tagName
 */
function findClosingTagAfterCursor(text, offset, tagName) {
  const stack = [];
  const openRegex = new RegExp(
    `<(${tagName})[^>]*>|<([a-z][a-z0-9]*)[^>]*>`,
    "gi"
  );
  const closeRegex = new RegExp(`<\\/(${tagName}|[a-z][a-z0-9]*)\\s*>`, "gi");
  let index = offset;
  while (true) {
    const nextClose = closeRegex.exec(text.substring(index));
    if (!nextClose) return null;
    const closePos = index + nextClose.index;
    const closeTag = nextClose[1].toLowerCase();
    // 检查之间是否有同类型开标签
    let hasMatchingOpen = false;
    openRegex.lastIndex = offset;
    let openMatch;
    while ((openMatch = openRegex.exec(text.substring(offset, closePos)))) {
      const currentTag = (openMatch[1] || openMatch[2]).toLowerCase();
      if (currentTag === closeTag) hasMatchingOpen = true;
    }
    if (closeTag === tagName.toLowerCase() && !hasMatchingOpen) {
      return { start: closePos, end: closePos + nextClose[0].length };
    }
    index = closePos + 1;
  }
}
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
