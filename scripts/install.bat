ECHO on
FOR /f %%i IN ('dir /ad /b "C:\" ^|findstr /I "mongo"') DO set dest=%%i
MOVE C:\%dest% C:\mongodb
SETX PATH "%PATH%;C:\mongodb\bin"
