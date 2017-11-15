call ..\..\..\bin\node_bin\nodevars.bat
cd ..\..\
call yarn install > %~dp0\output.txt
call yarn run build:selfservice --offline
cd %~dp0
pause