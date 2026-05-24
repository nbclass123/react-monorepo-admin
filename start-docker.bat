@echo off
chcp 65001 > nul
echo ========================================
echo   Docker 前端项目快速启动脚本
echo ========================================
echo.

REM 检查 Docker 是否运行
docker version > nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo [1/4] 检查后端服务状态...
cd /d E:\javaProject\hy-platform\.docs
docker ps | findstr hu-platform > nul
if errorlevel 1 (
    echo       后端服务未运行，正在启动...
    docker-compose up -d
    echo       等待服务启动（30秒）...
    timeout /t 30 /nobreak > nul
) else (
    echo       后端服务已运行
)

echo.
echo [2/4] 返回前端目录并构建镜像...
cd /d e:\myProject\react-app-java
docker-compose build --no-cache

echo.
echo [3/4] 启动前端服务...
docker-compose up -d

echo.
echo [4/4] 检查服务状态...
docker-compose ps

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 访问地址：
echo   - 前端应用：http://localhost:8088
echo   - 后端网关：http://localhost:8080
echo   - Nacos控制台：http://localhost:8848/nacos
echo.
echo 常用命令：
echo   - 查看日志：docker-compose logs -f
echo   - 停止服务：docker-compose down
echo   - 重启服务：docker-compose restart
echo.
pause
