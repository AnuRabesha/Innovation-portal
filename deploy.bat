@echo off
set GIT="C:\Program Files\Git\bin\git.exe"

echo Setting remote origin...
%GIT% remote remove origin 2>nul
%GIT% remote add origin https://github.com/AnuRabesha/Innovation-portal.git

echo Renaming branch to main...
%GIT% branch -M main

echo Committing...
%GIT% commit -m "Initial commit"

echo Pushing to GitHub...
%GIT% push -u origin main

echo.
echo Done! Check https://github.com/AnuRabesha/Innovation-portal
pause
