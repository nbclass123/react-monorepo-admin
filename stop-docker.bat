@echo off
chcp 65001 > nul
echo ========================================
echo   Docker 前端服务停止脚本
echo ========================================
echo.

cd /d e:\myProject\react-app-java

echo 停止前端服务...
docker-compose down

echo.
echo [完成] 前端服务已停止
echo.
echo 注意：后端服务仍在运行
echo 如需停止后端，请运行：
echo   cd E:\javaProject\hy-platform\.docs
echo   docker-compose down
echo.
pause
