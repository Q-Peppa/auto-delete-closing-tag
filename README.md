# Auto-delete-closing-tag 

This plugin will automatically delete the closing tag when you type / in the opening tag.

## Features

Before:
```jsx
<div $1>demo text </div>
```
When you type `/` in the $1 position, the closing tag and inner children will be deleted. Then the tag will become Self-closing.

After:
```jsx
<div />
```

--- 
Before:
```jsx
<App $1>
  <div>demo text </div>
  <p>demo text</p>
  <span>demo text</span>
</App>
```

After:
```jsx
<App />
```

## Installation
1. Open the Extensions sidebar in VS Code. Then search for "Auto-delete-closing-tag".
2. Click Install.


## Notice
This plugin only works in the `[jsx, tsx , html]`  files.