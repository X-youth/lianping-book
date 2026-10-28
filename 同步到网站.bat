@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;%PATH%"
set "GH_CONFIG_DIR=c:\Users\xiao\.trae-cn\plugin-data\gh-config"

echo === 正在同步到 GitHub ===
git add .
git commit -m "更新画册 %date% %time:~0,5%" >nul 2>&1

for /l %%i in (1,1,3) do (
  git pull --rebase >nul 2>&1
  git push >nul 2>&1 && goto :ok
  echo 网络不稳定，第 %%i 次重试...
  timeout /t 6 >nul
)
echo.
echo 同步失败：连不上 GitHub，网络问题，稍后再双击本脚本重试即可。
pause
exit /b 1

:ok
echo.
echo === 完成！网站 1-2 分钟后自动更新 ===
echo 网址: https://x-youth.github.io/lianping-book/
pause
