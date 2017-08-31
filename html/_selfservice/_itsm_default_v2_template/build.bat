call ..\..\..\bin\node_bin\nodevars.bat
cd ..\..\
call yarn install --offline
call yarn run build:selfservice --offline
cd %~dp0