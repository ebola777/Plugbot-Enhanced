@echo off
@setLocal EnableExtensions EnableDelayedExpansion

:: Scripts directory
set DIR_SCRIPT=..\js
:: Css directory
set DIR_CSS=..\css
:: Script extension regex
set SCRIPT_EXT=*.js
:: Exclusion list file
set FILE_EXCLUSION=exclusion.txt
:: Js options file
set FILE_OPTIONS_JS=options-js.txt
:: Css options file
set FILE_OPTIONS_CSS=options-css.txt


:: Load script exclusion list
set numExclusion=1
for /f "tokens=1 delims=" %%j in (%FILE_EXCLUSION%) do (
	set exclusion[!numExclusion!]=%%j
	set /a numExclusion+=1
)
set /a numExclusion-=1

:: Show exclusion list
echo Exclusion list:
for /l %%i in (1,1,%numExclusion%) do (
	echo FILE: "!exclusion[%%i]!"
)
echo %numExclusion% items
echo.

:: Get script directory full path
pushd %DIR_SCRIPT%
set pathScript=%cd%
popd

:: Find script files, generate inclusion list
set numInclusion=1
for /r "%DIR_SCRIPT%" %%i in ("%SCRIPT_EXT%") do (
	:: full path
	set fullpath=%%~i
	:: file name
	set filename=%%~ni%%~xi
	:: get relative path
	set relativePath=!fullpath:%pathScript%\=!
	:: replace \ with /
	set relativePath=!relativePath:\=/!
	:: is current file included
	set isInclude=1

	:: is relative path in exclusion array?
	for /l %%j in (1,1,!numExclusion!) do (
		if !relativePath! equ !exclusion[%%j]! (
			set isInclude=0
		)
	)

	if 1 equ !isInclude! (
		set inclusion[!numInclusion!]=!relativePath!
		set /a numInclusion+=1
	) else (
		echo EXCLUDED "!relativePath!"
	)
)
set /a numInclusion-=1
echo.

:: Show inclusion scripts
echo Inclusion list:
for /l %%i in (1,1,%numInclusion%) do (
	echo FILE: "!inclusion[%%i]!"
)
echo %numInclusion% items
echo.

:: Generate UglifyJS arguments
set scripts=

for /l %%i in (1,1,!numInclusion!) do (
	set scripts=!scripts! !inclusion[%%i]!
)

:: Refactor debug.js to release.js
echo # Refactoring debug.js to release.js
call Refactor-Debug
copy /y "data\output\release.js" "%DIR_SCRIPT%\release.js"
echo.

:: Optimize js
echo # Optimizing js...
set /p options=<"%FILE_OPTIONS_JS%"
echo Options: %options%
pushd "%DIR_SCRIPT%"
call uglifyjs %scripts% %options%
popd
echo.

:: Optimize css
echo # Optimizing css...
set /p options=<"%FILE_OPTIONS_CSS%"
echo Options: %options%
call csstidy "%DIR_CSS%\style.css" %options% "%DIR_CSS%\style.min.css"
echo.

echo.
echo Done^^!

pause
