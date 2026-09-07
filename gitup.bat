@echo off
set GIT_PATH="D:\Git\cmd\git.exe"
if not exist %GIT_PATH% set GIT_PATH=git

set MSG=%*
if "%MSG%"=="" set MSG=Update

echo [1/3] Staging changes...
%GIT_PATH% add .

echo [2/3] Committing changes with message: "%MSG%"...
%GIT_PATH% commit -m "%MSG%"

echo [3/3] Pushing to GitHub...
%GIT_PATH% push origin main

echo Done!
