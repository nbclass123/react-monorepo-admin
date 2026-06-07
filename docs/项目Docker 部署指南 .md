# Docker 部署指南 — hy-platform-web

## 架构概览

```
浏览器 (用户)
  │
  ├── http://<server-ip>/         → 前端静态资源 (Nginx:80)
  │
  └── http://<server-ip>/api/*    → Nginx:80 反向代理 → gateway:8080 → 后端微服务
                                     ↑
                            Docker 网络 hu-platform-net
```

- **前端容器** `hy-platform-web`：Nginx Alpine，监听 80 端口，提供静态资源 + API 反向代理
- **后端网关容器** `gateway`：Java Spring Cloud Gateway，监听 8080 端口
- **网络** `hu-platform-net`：两个容器通过该外部网络互通，Nginx 以容器名 `gateway` 访问网关

## 环境变量流转

```
GitHub Secrets (VITE_APP_BASE_URL, VITE_APP_TITLE)
  → docker build --build-arg
    → Dockerfile ENV
      → vite build (import.meta.env)
        → 编译进 JS bundle
          → 浏览器运行时使用
```

`VITE_APP_BASE_URL` 是**构建时**变量，在 `vite build` 阶段注入到 JS 代码中，浏览器通过该地址发起 API 请求。因此每次修改该值需要重新构建镜像。

## 镜像版本策略

| 标签           | 含义             | 用途         |
| ------------ | -------------- | ---------- |
| `v1.2.3`     | Git 标签对应的不可变版本 | 精确追溯、回滚    |
| `production` | 当前生产运行版本（滚动覆盖） | 快速回滚到上一次部署 |

每次推送 `v*` 标签时，CI 同时打上版本标签和 `production` 标签。回滚时只需将服务器 compose 文件中的镜像标签改为上一版本号即可。

## 服务器前置条件

- Docker Engine 20.10+（含 `docker compose` 插件）
- `hu-platform-net` 网络已存在（否则部署脚本会自动创建）
- 后端网关容器 `gateway` 在该网络中运行并监听 8080 端口
- 80 端口未被占用
- 服务器可访问 Docker Hub 拉取镜像
- SSH 免密登录已配置（或使用密钥）

## GitHub Secrets 配置

在仓库 `Settings → Environments → production` 中配置以下 Secrets：

| Secret                | 说明                      | 示例                                         |
| --------------------- | ----------------------- | ------------------------------------------ |
| `DOCKER_HUB_USERNAME` | Docker Hub 用户名          | `mycompany`                                |
| `DOCKER_HUB_TOKEN`    | Docker Hub Access Token | `dckr_pat_xxx...`                          |
| `VITE_APP_BASE_URL`   | 浏览器访问 API 的地址           | `http://124.221.127.123:8080/api`          |
| `VITE_APP_TITLE`      | 网页标题                    | `呼呼呼管理系统`                                  |
| `SERVER_HOST`         | 生产服务器 IP 或域名            | `124.221.127.123`                          |
| `SERVER_USER`         | SSH 登录用户名               | `root`                                     |
| `SERVER_SSH_KEY`      | SSH 私钥（换行符保留）           | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SERVER_PORT`         | SSH 端口（可选，默认 22）        | `22`                                       |

**注意**：

- `DOCKER_HUB_TOKEN` 不是密码，需要在 Docker Hub `Account Settings → Security → New Access Token` 创建
- `SERVER_SSH_KEY` 是多行值，GitHub Secrets 会保留换行符

## CI/CD 流程

```
git tag v1.0.0 && git push origin v1.0.0
  │
  ├── GitHub Actions 触发 deploy-production.yml
  │     │
  │     ├── [1] 检出代码
  │     ├── [2] 安装 pnpm + 构建验证（ci.yml 并行运行）
  │     ├── [3] Docker Buildx 构建镜像
  │     ├── [4] 推送镜像到 Docker Hub（v1.0.0 + production 双标签）
  │     └── [5] SSH 到生产服务器
  │           │
  │           ├── docker pull 新镜像
  │           ├── 写入 docker-compose.prod.yml
  │           ├── 确保 hu-platform-net 网络存在
  │           ├── docker compose up -d（滚动更新）
  │           ├── 轮询健康检查（最长 90s）
  │           │     ├── healthy → 成功
  │           │     └── unhealthy → 打印日志 + 退出失败
  │           └── 清理 72h 前的旧镜像
  │
  └── 部署完成，用户访问 http://<server-ip>/
```

## 手动部署（不通过 CI）

```bash
# 1. 在开发机上构建并推送
docker build \
  --build-arg VITE_APP_BASE_URL=http://124.221.127.123:8080/api \
  --build-arg VITE_APP_TITLE=呼呼呼 \
  -t <username>/hy-admin:manual .
docker push <username>/hy-admin:manual

# 2. SSH 到服务器
ssh root@124.221.127.123

# 3. 在服务器上部署
cd /opt/hy-platform-web
IMAGE_TAG=manual DOCKER_HUB_USERNAME=<username> docker compose -f docker-compose.prod.yml up -d
```

## 回滚步骤

```bash
# SSH 到服务器
ssh root@<server-ip>

# 方案 A：回滚到指定版本
cd /opt/hy-platform-web
IMAGE="<username>/hy-admin:v1.0.1"
docker pull "${IMAGE}"
sed -i "s|image:.*|image: ${IMAGE}|g" docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d --pull never

# 方案 B：回滚到上一次 production（如果还没被覆盖）
IMAGE="<username>/hy-admin:production"
docker pull "${IMAGE}"
sed -i "s|image:.*|image: ${IMAGE}|g" docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d --pull never

# 验证
docker ps --filter name=hy-platform-web
curl -f http://localhost/health
```

## 常见问题

### 1. 部署后页面空白或 API 请求 404

检查 `VITE_APP_BASE_URL` 是否正确。该值在构建时注入，容器启动后不可更改。

### 2. 容器启动后立即退出

查看日志：

```bash
docker logs hy-platform-web
```

常见原因：80 端口被占用、Nginx 配置文件语法错误。

### 3. 后端 API 请求超时

- 确认 `gateway` 容器在 `hu-platform-net` 网络中运行：`docker network inspect hu-platform-net`
- 确认前端容器也加入了该网络：`docker inspect hy-platform-web | grep hu-platform-net`
- 在容器内测试连通性：`docker exec hy-platform-web wget -qO- http://gateway:8080/`

### 4. 镜像拉取失败

- 确认 Docker Hub Token 未过期
- 确认网络能访问 `docker.io`
- 配置镜像加速器（如阿里云、腾讯云等）

### 5. 健康检查失败

```bash
# 查看健康检查日志
docker inspect hy-platform-web --format='{{json .State.Health}}' | python3 -m json.tool
# 或直接测试
curl http://localhost/health
```

## 本地开发

本地开发使用 `docker-compose.yml`（非 prod 版本），适合配合后端一起调试：

```bash
# 启动
docker compose up -d
# 或 Windows 下双击 start-docker.bat

# 停止
docker compose down
# 或 Windows 下双击 stop-docker.bat

# 访问
# http://localhost:8088
```

本地 compose 与生产 compose 的区别：

| 项目   | 本地 `docker-compose.yml`      | 生产 `docker-compose.prod.yml` |
| ---- | ---------------------------- | ---------------------------- |
| 镜像来源 | 本地构建 `build:`                | 远程拉取 `image:`                |
| 端口   | 8088:80                      | 80:80                        |
| 网络   | `hu-platform-net` (external) | `hu-platform-net` (external) |
| 资源限制 | 无                            | CPU 0.5 / 内存 256M            |
| 日志轮转 | 无                            | max-size 10m / max-file 3    |
| 变量注入 | Dockerfile ARG               | 环境变量 `${IMAGE_TAG}`          |

