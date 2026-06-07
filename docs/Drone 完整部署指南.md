# Drone CI/CD 完整部署指南

> 本文整合了 Drone 服务端部署 + GitHub OAuth 配置 + Secrets 配置 + 发布命令，按操作位置分为四大块。
>
> **场景**：只有公网 IP、没有域名、HTTP 协议。

***

## 目录

- [一、GitHub 侧配置](#一github-侧配置)
- [二、服务器侧部署](#二服务器侧部署)
- [三、Drone Web 后台配置](#三drone-web-后台配置)
- [四、项目配置](#四项目配置)
- [五、发布命令](#五发布命令)
- [六、与 GitHub Actions 并存](#六与-github-actions-并存)
- [七、常见问题](#七常见问题)

***

## 操作位置速览

```
┌─────────────────────────────────────────────────────────┐
│  操作位置            │  做什么                            │
├─────────────────────────────────────────────────────────┤
│  GitHub 网站          │  创建 OAuth App、获取凭据          │
│  服务器终端 (SSH)     │  部署 Drone Server + Runner       │
│  Drone Web UI        │  激活仓库、配置 7 个 Secret        │
│  项目代码 (本地)      │  编写 .drone.yml、推送代码          │
└─────────────────────────────────────────────────────────┘
```

***

## 前置条件

| 资源        | 要求                                             |
| --------- | ---------------------------------------------- |
| 服务器       | 一台有公网 IP 的 Linux 服务器（Ubuntu 22.04 / CentOS 7+） |
| 公网 IP     | `124.221.127.123`，开放 **80 和 8080** 两个端口的入站访问   |
| Docker    | 服务器已安装 Docker + Docker Compose                 |
| GitHub 账号 | 有目标仓库的管理权限                                     |

**端口分配：**

| 端口       | 用途                     | 服务                      |
| -------- | ---------------------- | ----------------------- |
| **8080** | Drone Web UI + Webhook | `drone-server` 容器       |
| **80**   | 部署的前端应用（用户访问）          | `hy-platform-web` 容器    |
| 3000     | Drone Runner 内部端口      | `drone-runner` 容器（仅内部用） |

***

## 一、GitHub 侧配置

> **操作位置**：浏览器打开 <https://github.com>，在 GitHub 网站上操作。

### 1.1 创建 OAuth App

1. 打开 <https://github.com/settings/developers>
2. 或者：GitHub → 头像 → Settings → Developer settings → OAuth Apps → **New OAuth App**

### 1.2 填写表单

| 字段                         | 值                                   |
| -------------------------- | ----------------------------------- |
| Application name           | `Drone CI`                          |
| Homepage URL               | `http://124.221.127.123:8080`       |
| Authorization callback URL | `http://124.221.127.123:8080/login` |

> 把 `124.221.127.123` 换成你的实际公网 IP。

点击 **Register application**。

### 1.3 获取 OAuth 凭据

注册成功后页面会显示：

- **Client ID** — 页面顶部直接显示，复制下来
- **Client Secret** — 点击 **Generate a new client secret**，生成后**立刻复制**（关闭页面后无法再看）

> 这两个值稍后要填入服务器的 `docker-compose.yml`。

***

## 二、服务器侧部署

> **操作位置**：SSH 连接到服务器，在终端中操作。

### 2.1 创建 Drone 工作目录

```bash
mkdir -p /opt/drone
cd /opt/drone
```

### 2.2 生成密钥

```bash
# RPC 密钥（Runner 连接 Server 用）
openssl rand -hex 16
# 示例输出：4279e98a745054610c2e2d8aee635f48

# Cookie 密钥（加密浏览器 Cookie 用）
openssl rand -hex 16
# 示例输出：324ee64e20b07cd2306eaff4f916a89f
```

> 把生成的两串密钥记下来，下面要用。

### 2.3 创建 docker-compose.yml

在 `/opt/drone/docker-compose.yml` 创建以下内容：

```yaml
services:
  drone-server:
    image: drone/drone:2
    container_name: drone-server
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./drone-data:/data
    environment:
      - DRONE_GITHUB_SERVER=https://github.com
      - DRONE_GITHUB_CLIENT_ID=<1.3 步获取的 Client ID>
      - DRONE_GITHUB_CLIENT_SECRET=<1.3 步获取的 Client Secret>
      - DRONE_RPC_SECRET=<2.2 步生成的 RPC 密钥>
      - DRONE_COOKIE_SECRET=<2.2 步生成的 Cookie 密钥>
      - DRONE_SERVER_HOST=<你的公网IP>:8080
      - DRONE_SERVER_PROTO=http
      - DRONE_USER_CREATE=username:<你的GitHub用户名>,admin:true

  drone-runner:
    image: drone/drone-runner-docker:1
    container_name: drone-runner
    restart: always
    depends_on:
      - drone-server
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DRONE_RPC_PROTO=http
      - DRONE_RPC_HOST=<你的公网IP>:8080
      - DRONE_RPC_SECRET=<与上面 drone-server 的 RPC 密钥相同>
      - DRONE_RUNNER_CAPACITY=2
      - DRONE_RUNNER_NAME=runner-01
```

### 2.4 启动服务

```bash
cd /opt/drone
docker compose up -d

# 查看启动日志
docker compose logs drone-server
# 看到 "starting the http server on :80" 即启动成功

# 确认 Runner 已连接 Server
docker logs drone-runner | grep "successfully connected"
```

### 2.5 验证外部访问

浏览器打开 `http://<你的公网IP>:8080`，应看到 Drone 登录页面。

> 访问不了：检查防火墙 `ufw allow 8080`，或云服务商安全组放行 TCP 8080。

***

## 三、Drone Web 后台配置

> **操作位置**：浏览器打开 `http://<你的公网IP>:8080`，在 Drone Web UI 中操作。

### 3.1 登录 Drone

1. 打开 `http://<你的公网IP>:8080`
2. 点击 **Continue with GitHub** → 跳转到 GitHub 授权页
3. 点击 **Authorize drone**
4. 跳回 Drone Dashboard

### 3.2 激活仓库

1. Drone Dashboard 右上角点 **Sync**（环形箭头图标）
2. 搜索框输入仓库名定位
3. 点击仓库 → 点击 **Activate Repository**

激活后，GitHub 仓库 `Settings → Webhooks` 会自动出现一条 `http://<IP>:8080/hook` 的 Webhook。

> 如果没看到 Webhook：在 Drone 中 Deactivate → 再 Activate 一次。

### 3.3 配置 Secrets

> **重要**：Drone 的 Secret 和 GitHub Actions 的 Secret **完全独立**，需要重新配置。

进入：仓库页面 → **Settings** → **Secrets** → 点击 **"+ New Secret"**，依次添加以下 7 个 Secret。

***

#### Secret 1：`docker_hub_username` — Docker Hub 用户名

**在哪里获取：** 打开 [hub.docker.com](https://hub.docker.com) → 登录 → 右上角头像旁边的用户名。

```
Name:  docker_hub_username
Value: <你的 Docker Hub 用户名，如 huhanwen>
```

***

#### Secret 2：`docker_hub_token` — Docker Hub 访问令牌

**在哪里获取：**

1. 打开 [hub.docker.com](https://hub.docker.com) → 登录
2. 右上角头像 → **Account Settings** → 左侧 **Personal access tokens**
3. 点击 **Generate new token**，描述填 `drone-ci`，权限选 **Read & Write**
4. 点击 **Generate**，**立刻复制** token（`dckr_pat_xxxx...`，关闭后无法再看）

```
Name:  docker_hub_token
Value: dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 不能用 Docker Hub 登录密码，必须用 Access Token。

***

#### Secret 3：`vite_app_base_url` — 后端 API 地址

**需求：** 前端请求后端 API 的基础地址，Docker 构建时编译进 JS 文件。

```
Name:  vite_app_base_url
Value: http://124.221.127.123/api
```

***

#### Secret 4：`vite_app_title` — 网页标题

**需求：** 浏览器标签页显示的标题。

```
Name:  vite_app_title
Value: 番茄
```

***

#### Secret 5：`server_host` — 服务器 IP

```
Name:  server_host
Value: 124.221.127.123
```

***

#### Secret 6：`server_user` — SSH 用户名

建议创建专门的 `deploy` 用户：

```bash
# 在服务器上执行
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
```

```
Name:  server_user
Value: deploy
```

***

#### Secret 7：`server_ssh_key` — SSH 私钥

**准备 SSH Key（如果没有）：**

```bash
# 在本地电脑上执行
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N "" -C "drone-deploy"

# 把公钥放到服务器上
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@<服务器IP>

# 测试免密登录
ssh -i ~/.ssh/deploy_key deploy@<服务器IP>

# 获取私钥完整内容
cat ~/.ssh/deploy_key
```

> 私钥必须是无密码的（`-N ""`）。Drone 不支持带密码的私钥。

把 `cat` 输出的**完整内容**（包括 `-----BEGIN` 和 `-----END` 行）粘贴进去：

```
Name:  server_ssh_key
Value: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAA...
...（完整复制，不要遗漏任何字符）...
-----END OPENSSH PRIVATE KEY-----
```

> Drone 的 Secret Value 输入框支持多行文本，直接粘贴即可。

***

### 全部配置完成后

Settings → Secrets 页面应看到 7 条记录：

```
docker_hub_username    ******
docker_hub_token       ******
vite_app_base_url      ******
vite_app_title         ******
server_host            ******
server_user            ******
server_ssh_key         ******
```

### Secret 与 .drone.yml 的对应关系

Secret 保存在 Drone 服务端，`.drone.yml` 通过名字引用：

```
Drone 服务端 Secrets                  .drone.yml 中的引用
────────────────────────             ────────────────────
docker_hub_username → "huhanwen"     from_secret: docker_hub_username
docker_hub_token    → "dckr_pat_.."  from_secret: docker_hub_token
vite_app_base_url   → "http://..."   from_secret: vite_app_base_url
vite_app_title      → "番茄"          from_secret: vite_app_title
server_host         → "124.221..."   from_secret: server_host
server_user         → "deploy"       from_secret: server_user
server_ssh_key      → "-----BEGIN.." from_secret: server_ssh_key
```

`.drone.yml` 里永远只出现 Secret 的**名字**，不出现真实值，可以安全提交 Git。

***

## 四、项目配置

> **操作位置**：本地项目代码，编辑 `.drone.yml` 后提交到 Git。

### 4.1 .drone.yml 说明

项目根目录的 [.drone.yml](../.drone.yml) 包含两条流水线：

| 流水线        | 触发条件               | 作用                                 |
| ---------- | ------------------ | ---------------------------------- |
| `CI/CD 测试` | push / PR → master | 安装依赖 → lint → format:check → build |
| `部署到生产环境`  | tag `drone-v*`     | Docker 构建 → 推送镜像 → SSH 部署 → 健康检查   |

### 4.2 GitHub Actions → Drone 对照

| 场景        | GitHub Actions                | Drone                                 |
| --------- | ----------------------------- | ------------------------------------- |
| 检出代码      | `actions/checkout@v4`         | **自动克隆**，无需声明                         |
| Node 环境   | `actions/setup-node@v4`       | `image: node:20-alpine` 自带            |
| pnpm      | `pnpm/action-setup@v4`        | `corepack enable && corepack prepare` |
| 密钥引用      | `${{ secrets.X }}`            | `from_secret: x`                      |
| 部署 Tag 触发 | `release-v*`                  | `drone-v*`                            |
| 版本号       | `${GITHUB_REF#refs/tags/}`    | `${DRONE_TAG}` 直接可用                   |
| Docker 构建 | `docker/build-push-action@v5` | `plugins/docker`                      |
| SSH 部署    | `appleboy/ssh-action@v1`      | `appleboy/drone-ssh`                  |
| 步骤间共享文件   | 同一 Runner（天然持久）               | 需配置 `volumes` 临时卷                     |

***

## 五、发布命令

> **操作位置**：本地终端。

### GitHub Actions 发布

```bash
# 创建 release 标签
git tag -a release-v1.0.1 -m "发布 v1.0.1 版本"

# 推送标签（触发 GitHub Actions 部署）
git push origin release-v1.0.1
```

### Drone 发布

```bash
# 创建 drone 标签
git tag -a drone-v1.0.1 -m "发布 v1.0.1 版本"

# 推送标签（触发 Drone 部署）
git push origin drone-v1.0.1
```

### CI 校验（无需打 tag，推送代码自动触发）

```bash
git add .
git commit -m "feat: 新增功能"
git push origin master
# 推送后 GitHub Actions 和 Drone 同时运行 CI 流水线
```

### 查看流水线

| 平台             | 地址                                          |
| -------------- | ------------------------------------------- |
| GitHub Actions | `https://github.com/<owner>/<repo>/actions` |
| Drone          | `http://<你的公网IP>:8080` → 点击仓库名              |

### 验证部署

```bash
# 检查容器状态
ssh deploy@<服务器IP> docker ps --filter name=hy-platform-web

# 测试健康检查
curl http://<服务器IP>/health

# 查看容器日志
ssh deploy@<服务器IP> docker logs hy-platform-web --tail=50
```

### 回滚

```bash
ssh deploy@<服务器IP>
cd /opt/hy-platform-web

# 拉取上一版本镜像
IMAGE="<username>/hy-admin:v1.0.0"
docker pull "${IMAGE}"

# 替换镜像标签
sed -i "s|image:.*|image: ${IMAGE}|g" docker-compose.yml

# 应用更新
docker compose up -d --pull never
```

***

## 六、与 GitHub Actions 并存

两个平台同时运行，互不干扰：

```
项目根目录
├── .drone.yml              ← Drone 配置
├── .github/
│   └── workflows/
│       ├── ci.yml           ← GitHub Actions CI
│       └── deploy-production.yml  ← GitHub Actions 部署
├── Dockerfile
└── ...
```

| 对比        | GitHub Actions                        | Drone                             |
| --------- | ------------------------------------- | --------------------------------- |
| Secret 存放 | GitHub → Settings → Secrets → Actions | Drone Web UI → Settings → Secrets |
| CI 触发     | push/PR → master                      | push/PR → master                  |
| 部署 tag    | `release-v*`                          | `drone-v*`                        |
| 配置文件      | `.github/workflows/*.yml`             | `.drone.yml`                      |
| 运行环境      | GitHub 托管 Runner                      | 你自己的服务器 Runner                    |

- Git push 事件**同时**发送给 Drone Webhook 和 GitHub Actions
- 各用各的 Secret，互不影响
- 一个挂了另一个照常跑

***

## 七、常见问题

### Q1: 访问不了 `http://<IP>:8080`？

- 防火墙放行 8080：`ufw allow 8080`
- 云服务商安全组：入方向放行 TCP 8080
- 检查容器：`docker ps | grep drone-server`

### Q2: Pipeline 一直 Pending？

```bash
# Runner 连接了吗？
docker logs drone-runner | grep "successfully connected"

# Runner 容量满了吗？
docker logs drone-runner | tail -20
```

### Q3: GitHub Webhook 没注册上？

GitHub 仓库 → Settings → Webhooks → 应有 `http://<IP>:8080/hook`。没有的话 Drone 中 Deactivate → Activate。

### Q4: clone 代码失败？

在 `.drone.yml` 顶部加：

```yaml
clone:
  depth: 1
```

### Q5: SSH 认证失败？

- 确认私钥无密码（`ssh-keygen` 时用了 `-N ""`）
- 确认公钥已追加到服务器 `~/.ssh/authorized_keys`
- 确认 Secret 值粘贴完整（包含 BEGIN/END 行）

### Q6: Docker Hub 登录失败？

- 必须用 Access Token（`dckr_pat_xxx`），不能用登录密码
- Token 权限需要 **Read & Write**

### Q7: Drone Secret 和 GitHub Actions Secret 是同一个吗？

**不是。** 两套系统完全独立，需要分别配置。互不相通。

### Q8: 换服务器需要重新配置 Secret 吗？

**不需要。** Secret 存储在 Drone Server 的 `/opt/drone/drone-data/` 目录中。只要 Drone Server 没重建，Secret 都在。只需更新 IP 变了的 Secret（如 `server_host`）。

***

## 涉及文件汇总

| 文件                   | 路径                                | 说明                         |
| -------------------- | --------------------------------- | -------------------------- |
| `docker-compose.yml` | `/opt/drone/`                     | Drone Server + Runner 服务定义 |
| `drone-data/`        | `/opt/drone/`                     | Drone 数据目录（自动生成，含 Secret）  |
| `.drone.yml`         | 项目根目录                             | Drone 流水线配置（提交到 Git）       |
| OAuth App            | GitHub Developer Settings         | Drone 登录授权                 |
| Secrets × 7          | Drone Web UI → Settings → Secrets | 敏感信息存放                     |

