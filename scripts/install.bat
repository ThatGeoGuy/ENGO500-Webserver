@ECHO on
SETLOCAL
FOR /f %%i IN (
 'dir /ad /b "C:\" |findstr /I "mongo"'
) DO CALL :movedir %%i

:movedir 
SET "dest=%1"
ECHO MOVE "C:\"%1 "C:\mongodb\"
setx MYPATH "%PATH%;C:\mongodb\bin"
