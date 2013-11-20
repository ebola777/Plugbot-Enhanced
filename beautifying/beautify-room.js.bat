@echo off

:: Input script
set FILE_INPUT=input/room.js
:: Output script
set FILE_OUTPUT=output/room.js
:: Js options file
set FILE_OPTIONS_JS=options-room.js.txt

:: Beautify js
echo # Beautifying js...
set /p options=<"%FILE_OPTIONS_JS%"
echo Options: %options%
js-beautify -f %FILE_INPUT% -o %FILE_OUTPUT% %options%
echo.

echo.
echo Done^^!

pause
