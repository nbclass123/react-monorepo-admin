# Harbor 镜像仓库部署教程

> Harbor 是一个开源的容器镜像仓库，用于存储、签发和扫描 Docker 镜像。本文介绍如何使用 Harbor 替换 Docker Hub 作为项目的镜像仓库。

## 一、安装 Harbor

### 1.1 前置条件

| 资源 | 要求 |
|------|------|
| 服务器 | Linux (Ubuntu 22.04 / CentOS 7+)，有公网 IP 或内网可访问 |
| CPU | 2 核+ |
| 内存 | 4 GB+ |
| 磁盘 | 40 GB+（镜像存储） |
| Docker | 20.10+ |
| Docker Compose | v2.0+ |

### 1.2 下载并安装

```bash
# 下载 Harbor 离线安装包（以 v2.10.0 为例）
wget https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz

# 解压
tar xzvf harbor-offline-installer-v2.10.0.tgz
cd harbor

# 复制配置文件模板
cp harbor.yml.tmpl harbor.yml
```

**如果 GitHub 下载慢**，可使用国内镜像加速：

```bash
wget https://ghproxy.com/https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz
```

### 1.3 配置 harbor.yml

编辑 `harbor.yml`，关键配置如下：

```yaml
# Harbor 访问地址（改成你的服务器 IP 或域名）
hostname: 192.168.1.100

# HTTP 模式（无 HTTPS 证书时使用）
http:
  port: 80

# HTTPS 模式（有证书时推荐）
# https:
#   port: 443
#   certificate: /path/to/cert.pem
#   private_key: /path/to/key.pem

# 管理员密码
harbor_admin_password: Harbor12345

# 数据库密码
database:
  password: root123

# 数据存储目录
data_volume: /data/harbor
```

> 如果只在内网使用，HTTP 模式即可。公网访问强烈建议配置 HTTPS 证书。

### 1.4 启动 Harbor

```bash
# 安装并启动（含 Clair 漏洞扫描可选）
sudo ./install.sh

# 或用 --with-notary --with-trivy 增加额外组件
sudo ./install.sh --with-trivy
```

启动后访问 `http://<IP>`，用 `admin / Harbor12345` 登录。

---

## 二、配置 Docker 客户端

为了让 Docker 能推送/拉取 Harbor 中的镜像，需要配置 Docker daemon。

### 2.1 HTTP 模式（无证书）

编辑 `/etc/docker/daemon.json`：

```json
{
  "insecure-registries": ["192.168.1.100"]
}
```

重启 Docker：

```bash
sudo systemctl restart docker
```

### 2.2 HTTPS 模式（有证书）

将证书放到 `/etc/docker/certs.d/<harbor-hostname>/` 下即可，无需额外配置。

### 2.3 登录验证

```bash
docker login 192.168.1.100
# 用户名: admin
# 密码: Harbor12345
```

---

## 三、创建项目

Harbor 中镜像是按**项目**组织的，推送前需先创建项目。

1. 登录 Harbor Web UI
2. 左侧菜单 → **项目** → **新建项目**
3. 填写：
   - 项目名称：`hy-platform`
   - 访问级别：**公开**（可在 CI 中直接拉取）
   - 存储容量：默认 -1（无限制）
4. 点击确定

创建后，镜像完整路径为：`<harbor-host>/hy-platform/<image-name>:<tag>`

例如：`hbu.docker/hy-platform/hy-admin:release-v1.0.0`

---

## 四、配置机器人账户（推荐）

不要在 CI/CD 中使用管理员账户。为 CI 创建专用机器人账户：

1. Harbor Web UI → **机器人账户** → **新建机器人账户**
2. 填写：
   - 名称：`ci-bot`
   - 过期时间：永不过期（或按需设置）
   - 权限：选择项目 `hy-platform`，角色设为**项目管理员**（含推送/拉取权限）
3. 点击添加，**立即复制生成的 Token**（关闭后无法再看）

将 Token 配置到 CI/CD 的 Secrets 中：
- `HARBOR_REGISTRY` = `hbu.docker`
- `HARBOR_USERNAME` = `robot$ci-bot`
- `HARBOR_PASSWORD` = 复制的 Token

> 机器人账户的用户名格式为 `robot$<name>`，注意包含 `robot$` 前缀。

---

## 五、CI/CD 集成

### 5.1 Drone CI（通过 Kaniko 构建）

`.drone.yml` 中已配置使用 Kaniko 构建并推送到 Harbor：

```yaml
- name: 构建并推送Docker镜像
  image: registry.cn-hangzhou.aliyuncs.com/kaniko-project/executor:latest
  environment:
    HARBOR_REGISTRY:
      from_secret: HARBOR_REGISTRY
    HARBOR_USERNAME:
      from_secret: HARBOR_USERNAME
    HARBOR_PASSWORD:
      from_secret: HARBOR_PASSWORD
    DOCKER_REPO:
      from_secret: DOCKER_REPO
  commands:
    - mkdir -p /kaniko/.docker
    - echo '{"auths":{"${HARBOR_REGISTRY}":{"auth":"$(echo -n $HARBOR_USERNAME:$HARBOR_PASSWORD | base64)"}}}' > /kaniko/.docker/config.json
    - /kaniko/executor
        --context .
        --dockerfile Dockerfile
        --destination "${DOCKER_REPO}:${DRONE_TAG}"
        --destination "${DOCKER_REPO}:production"
        --build-arg VITE_APP_BASE_URL="${VITE_APP_BASE_URL}"
        --build-arg VITE_APP_TITLE="${VITE_APP_TITLE}"
        --cache=true
```

### 5.2 GitHub Actions

```yaml
- name: 登录 Harbor
  uses: docker/login-action@v3
  with:
    registry: ${{ secrets.HARBOR_REGISTRY }}
    username: ${{ secrets.HARBOR_USERNAME }}
    password: ${{ secrets.HARBOR_PASSWORD }}

- name: 构建并推送镜像
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ${{ secrets.HARBOR_REGISTRY }}/hy-platform/hy-admin:${{ steps.extract_tag.outputs.tag }}
      ${{ secrets.HARBOR_REGISTRY }}/hy-platform/hy-admin:production
```

### 5.3 部署服务器上拉取镜像

生产服务器需先登录 Harbor 再拉取：

```bash
echo "${HARBOR_PASSWORD}" | docker login "${HARBOR_REGISTRY}" -u "${HARBOR_USERNAME}" --password-stdin
docker pull hbu.docker/hy-platform/hy-admin:production
```

---

## 六、镜像管理

### 6.1 查看镜像

在 Harbor Web UI → **项目** → `hy-platform` → **镜像仓库** 中查看所有镜像和标签。

### 6.2 配置镜像保留策略

防止镜像无限累积占满磁盘：

1. 进入项目 → **策略** → **Tag 保留规则**
2. 添加规则：
   - 保留最近推送的 **10** 个版本标签
   - 保留 `production` 标签（不受清理影响）

### 6.3 配置垃圾回收

Harbor 删除镜像后不会立即释放磁盘空间，需手动执行 GC：

```bash
# 在 Harbor 服务器上
cd /opt/harbor
docker compose stop harbor-core
docker run -it --rm \
  -v /data/harbor/registry:/storage \
  -v /opt/harbor/common/config/registry/config.yml:/etc/docker/registry/config.yml \
  registry:2.8.3 garbage-collect /etc/docker/registry/config.yml
docker compose start harbor-core
```

建议设置定时任务（crontab）每周执行一次。

---

## 七、常用运维命令

```bash
# 查看 Harbor 运行状态
cd /opt/harbor
docker compose ps

# 重启 Harbor
docker compose restart

# 停止 Harbor
docker compose down

# 查看 Harbor 日志
docker compose logs -f harbor-core

# 备份 Harbor 数据
tar czvf harbor-backup-$(date +%Y%m%d).tar.gz /data/harbor /opt/harbor/harbor.yml
```

---

## 八、故障排查

### 8.1 推送镜像报 413 Request Entity Too Large

Nginx 默认上传限制为 1MB，Harbor 的 Nginx 需调整：

```bash
# 编辑 Harbor 安装目录下的 common/config/nginx/nginx.conf
# 增加 client_max_body_size 0;

docker compose restart nginx
```

### 8.2 HTTP 模式下 docker login 被拒绝

确认 `/etc/docker/daemon.json` 中已添加 `insecure-registries`，并重启 Docker。

### 8.3 磁盘空间不足

```bash
# 查看 Harbor 数据目录大小
du -sh /data/harbor

# 在 Harbor Web UI 中执行垃圾回收清理
# 手动清理未使用的镜像标签
```

### 8.4 Kaniko 推送超时

如果 Kaniko 构建时推送 Harbor 超时，可能是 Harbor 和 Drone Runner 不在同一网络。确保两者网络可达。

---

## 九、与 Docker Hub 对比

| 项目 | Docker Hub | Harbor |
|------|-----------|--------|
| 部署方式 | 云服务，无需自建 | 自建，需服务器 |
| 网络速度 | 国内访问慢 | 局域网/同网络极快 |
| 速率限制 | 匿名 100 pulls/6h | 无限制 |
| 私密性 | 需付费 | 完全私有 |
| 镜像扫描 | 需付费 | 内置 Trivy 免费扫描 |
| CI/CD 集成 | 无需 docker login | 需在 CI 中配置 Harbor 认证 |
| 存储成本 | 免费额度有限 | 取决于服务器磁盘 |
