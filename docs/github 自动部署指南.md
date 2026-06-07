# 自动部署指南

## 前置条件

### 1. 服务器端 SSH 密钥配置

```bash
# 在服务器上生成专用部署密钥对（无密码短语）
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N "" -C "github-actions-deploy"

# 公钥追加到 authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# 确保权限正确
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 查看私钥（复制到下一步的 GitHub Secrets）
cat ~/.ssh/github-actions
```

### 2. GitHub Secrets 配置

仓库 `Settings → Environments → production` 中添加：

| Secret | 说明 |
|--------|------|
| `HARBOR_REGISTRY` | Harbor 镜像仓库地址（如 `hbu.docker`） |
| `HARBOR_USERNAME` | Harbor 用户名 |
| `HARBOR_PASSWORD` | Harbor 密码或机器人 Token |
| `VITE_APP_BASE_URL` | 浏览器访问 API 的基础地址 |
| `VITE_APP_TITLE` | 网页标题 |
| `SERVER_HOST` | 生产服务器 IP |
| `SERVER_USER` | SSH 登录用户名（如 `root`） |
| `SERVER_SSH_KEY` | 上面 `cat` 输出的完整私钥内容（含首尾标记行） |
| `SERVER_PORT` | SSH 端口（默认 22，可不填） |

## 发布命令

### GitHub Actions 发布（tag 前缀：`release-v*`）

```bash
# 创建版本标签
git tag -a release-v1.0.1 -m "发布 v1.0.1 版本"

# 推送标签到远程（触发 GitHub Actions 自动部署）
git push origin release-v1.0.1
```

### Drone CI 发布（tag 前缀：`release-v*`）

```bash
# 创建版本标签
git tag -a drone-v1.0.1 -m "发布 v1.0.1 版本"

# 推送标签到远程（触发 Drone 自动部署）
git push origin drone-v1.0.1
```

`git push origin <tag>` 之后，对应的 CI/CD 平台自动触发以下流水线。

## 触发规则

| 平台 | 事件 | 触发工作流 | 说明 |
|------|------|-----------|------|
| GitHub Actions | `git push origin release-v*` | `deploy-production.yml` | 打版本标签 → 构建镜像 → 部署到生产 |
| Drone | `git push origin release-v*` | `.drone.yml` pipeline | 打版本标签 → 构建镜像 → 部署到生产 |
| GitHub Actions | `push: master` | `ci.yml` | 代码推送 → lint + format + build 校验 |
| Drone | `push: master` | `CI/CD 测试` pipeline | 代码推送 → lint + format + build 校验 |
| GitHub Actions | `pull_request: master` | `ci.yml` | PR → lint + format + build 校验 |
| Drone | `pull_request: master` | `CI/CD 测试` pipeline | PR → lint + format + build 校验 |

## CI/CD 流水线

```
开发机                          GitHub Actions                         服务器
───────                         ──────────────                         ──────

git tag -a release-v1.0.1 -m "..."
git push origin release-v1.0.1  ──→  [1] 检出代码
                                  │
                                  [2] Docker Buildx 构建
                                  │   ├── docker build
                                  │   │   --build-arg VITE_APP_BASE_URL
                                  │   │   --build-arg VITE_APP_TITLE
                                  │   └── 产物: Nginx + 静态资源
                                  │
                                  [3] 推送镜像到 Harbor
                                  │   ├── hy-admin:v1.0.1（不可变版本）
                                  │   └── hy-admin:production（滚动覆盖）
                                  │
                                  [4] SSH 连接服务器  ──────→  [5] 拉取镜像
                                  │     (appleboy/ssh-action)        │
                                  │                                  [6] 写入 compose 文件
                                  │                                  │   /opt/hy-platform-web/
                                  │                                  │   docker-compose.yml
                                  │                                  │
                                  │                                  [7] 滚动更新容器
                                  │                                  │   docker compose up -d
                                  │                                  │
                                  │                                  [8] 健康检查轮询
                                  │                                  │   每 3s 检查，最长 90s
                                  │                                  │
                                  │ ←────── 成功/失败 ────────────────┘
                                  │
                                  [9] 汇总结果
                                      ├── ✅ v1.0.1 部署成功
                                      └── ❌ v1.0.1 部署失败
```

## 验证部署

```bash
# 检查容器状态
ssh root@<server-ip> docker ps --filter name=hy-platform-web

# 测试健康检查
curl http://<server-ip>/health

# 查看容器日志
ssh root@<server-ip> docker logs hy-platform-web --tail=50
```

## 回滚

```bash
ssh root@<server-ip>

cd /opt/hy-platform-web

# 拉取上一个版本镜像
IMAGE="hbu.docker/hy-platform/hy-admin:v1.0.0"
docker pull "${IMAGE}"

# 替换 compose 文件中的镜像标签
sed -i "s|image:.*|image: ${IMAGE}|g" docker-compose.yml

# 应用更新
docker compose -f docker-compose.yml up -d --pull never
```

## 常见问题

### SSH 认证失败

```bash
# 在服务器上开启 DEBUG 日志
echo "LogLevel DEBUG" >> /etc/ssh/sshd_config && systemctl reload sshd

# 触发部署后查看日志
tail -100 /var/log/auth.log | grep -A5 "publickey\|Failed"

# 确认 authorized_keys 有效
ssh-keygen -lf /root/.ssh/authorized_keys

# 排查完关闭 DEBUG
sed -i '/^LogLevel DEBUG/d' /etc/ssh/sshd_config && systemctl reload sshd
```

### 镜像拉取失败

- Harbor 登录凭据过期 → 检查 Harbor 机器人 Token 有效期
- 网络不通 → 检查服务器能否访问 Harbor 仓库
- 权限不足 → 确认 Harbor 项目中当前用户有拉取权限

### 容器健康检查失败

```bash
docker inspect hy-platform-web --format='{{json .State.Health}}'
curl http://localhost/health
docker compose -f /opt/hy-platform-web/docker-compose.yml logs --tail=50
```
