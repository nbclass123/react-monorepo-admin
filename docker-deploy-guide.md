# Docker 前端项目部署配置

## 项目概述

本项目是一个 React + Vite 前端应用，通过 Docker 容器化部署。与后端系统（hu-platform）使用相同的 Docker 网络，实现容器间通信。

## 架构说明

```
┌─────────────────────────────────────────┐
│           宿主机浏览器                    │
│         http://localhost:8088           │
└────────────────┬──────────────────────┘
                 │ HTTP 请求
                 ▼
┌─────────────────────────────────────────┐
│     Docker Frontend (Nginx :80)         │
│         容器名: hy-platform-web         │
│         端口映射: 8088:80                │
└────────────────┬──────────────────────┘
                 │ /api/* 代理
                 ▼
┌─────────────────────────────────────────┐
│     Docker Gateway (Spring Cloud)      │
│         容器名: hu-platform-gateway     │
│         端口: 8080                      │
│     (来自 E:\javaProject\hy-platform)   │
└─────────────────────────────────────────┘
```

## 前置要求

1. **Docker Desktop** 已安装并运行
2. **后端服务已启动**（E:\javaProject\hy-platform\.docs\docker-compose.yml）

## 快速开始

### 1. 确保后端服务运行

```powershell
# 打开后端项目目录
cd E:\javaProject\hy-platform\.docs

# 启动后端服务（包含 MySQL, Redis, Nacos, Gateway 等）
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 2. 启动前端服务

```powershell
# 打开前端项目目录
cd e:\myProject\hy-admin

# 构建并启动前端服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### 3. 访问应用

- **前端地址**: http://localhost:8088
- **后端 Gateway**: http://localhost:8080
- **Nacos 控制台**: http://localhost:8848/nacos (默认账号: nacos/nacos)

## 常用命令

### 构建镜像

```powershell
# 仅构建 Docker 镜像
docker-compose build

# 构建并启动（后台运行）
docker-compose up -d --build
```

### 查看日志

```powershell
# 查看所有服务日志
docker-compose logs -f

# 仅查看前端日志
docker-compose logs -f frontend
```

### 停止服务

```powershell
# 停止并移除容器
docker-compose down

# 停止并移除容器和镜像
docker-compose down --rmi local
```

### 重启服务

```powershell
# 重启所有服务
docker-compose restart

# 重启前端服务
docker-compose restart frontend
```

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `/api` |
| `VITE_APP_TITLE` | 应用标题 | `呼呼呼` |

修改方法：
编辑 `docker-compose.yml` 中的 `args` 部分：

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=/api
        - VITE_APP_TITLE=我的应用
```

## 网络配置

前端使用外部网络 `hu-platform-net`（由后端 docker-compose 创建），确保容器间可以直接通过服务名通信。

- **gateway** → 后端网关服务
- **mysql** → MySQL 数据库
- **redis** → Redis 缓存
- **nacos** → Nacos 服务发现

## 故障排查

### 1. 前端无法访问后端 API

检查后端是否运行：

```powershell
docker ps | findstr gateway
```

如果未运行，启动后端：

```powershell
cd E:\javaProject\hy-platform\.docs
docker-compose up -d
```

### 2. 构建失败

清理缓存后重新构建：

```powershell
docker-compose down
docker builder prune -f
docker-compose up -d --build
```

### 3. 查看容器内部

```powershell
# 进入前端容器
docker exec -it hy-platform-web sh

# 检查 Nginx 配置
cat /etc/nginx/conf.d/default.conf

# 测试 API 连接
curl -I http://gateway:8080/api
```

## 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 8088 | 前端 Nginx | 前端应用入口 |
| 8080 | Gateway | 后端网关 |
| 8848 | Nacos | 服务注册中心 |
| 3306 | MySQL | 数据库 |
| 6379 | Redis | 缓存 |

## 注意事项

1. **先启动后端**：必须先启动后端服务创建网络，再启动前端
2. **环境变量时机**：Vite 环境变量在构建时就内联到代码中，修改后需要重新构建
3. **网络依赖**：前端依赖后端创建的 `hu-platform-net` 网络

## 目录结构

```
e:\myProject\hy-admin\
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像构建文件
├── docker/
│   └── nginx/
│       └── default.conf        # Nginx 反向代理配置
└── package.json
```
