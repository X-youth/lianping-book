@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;%PATH%"
set "GH_CONFIG_DIR=c:\Users\xiao\.trae-cn\plugin-data\gh-config"

echo === 正在同步到 GitHub ===
git add .
git commit -m "更新画册 %date% %time:~0,5%"
git push
echo.
echo === 完成！网站 1-2 分钟后自动更新 ===
echo 网址: https://x-youth.github.io/lianping-book/
pause
