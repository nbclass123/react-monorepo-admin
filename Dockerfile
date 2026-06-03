# 多阶段构建 Dockerfile
# 第一阶段：构建项目
FROM node:20-alpine AS builder

# 构建参数 - 用于在构建阶段传递 Vite 环境变量
ARG VITE_APP_BASE_URL
ARG VITE_APP_TITLE

# 设置环境变量
ENV VITE_APP_BASE_URL=${VITE_APP_BASE_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}

# 设置工作目录
WORKDIR /app

# 启用 corepack 以使用 pnpm（版本由 package.json 中 packageManager 字段指定）
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# 复制依赖清单文件
COPY pnpm-lock.yaml ./
COPY package.json ./

# 安装依赖（使用 frozen-lockfile 确保可复现构建）
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build:prod

# 第二阶段：运行项目（使用 Nginx）
FROM nginx:alpine

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
