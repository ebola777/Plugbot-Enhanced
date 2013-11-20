# Development

## Required software
- A modern browser
- A home network file server
	- ex. HTTP File Server
- A text editor
	- ex. Sublime Text
	- ex. Notepad++
- A Javascript IDE
    - ex. WebStorm
- A C++ IDE
	- Codeblocks
- A Sass compiler
- Code compressors
	- UglifyJs2
	- CSSTidy

## How to debug
1. Open "bookmarks/PlugBot Enhanced LOCAL DEBUG.html" in browser and drag the
	link to bookmark bar
2. Open HTTP File Server, drag GitHub project root folder
	(ex. C:/Users/MyUserName/Documents/GitHub/Plugbot-Enhanced)
	to HTTP File Server, choose Real folder
3. Enter a plug.dj room, click the bookmark "PlugBot Enhanced LOCAL DEBUG"

## How to release
1. Install UglifyJs2
2. Download CSSTidy and copy csstidy.exe to optimization/ folder
3. Copy cpp/app/bin/Debug/Refactor-Debug.exe to optimization/ folder
4. Run optimization/build.bat

## Beautifying
1. Install js-beautify
2. Run any bat file under beautifying/ folder

## C++ projects
- Refactor-Debug <br>
Refactors debug.js to release.js. release.js will be merged with other scripts
after optimization.
	and optimized in optimization process
	- Input files: script/debug.js, script/release.js
	- Output files: (at data/output) release.js

- Extract-PlugDJ <br>
Extracts Plug.DJ emoticons.
	- Input files: (at data/input) room.css, room.js
	- Output files: (at data/output) emoticons.txt
