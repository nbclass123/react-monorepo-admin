# GitHub Actions 配置教程

## 简介

GitHub Actions 是 GitHub 提供的持续集成和持续部署（CI/CD）服务，可以自动化软件构建、测试和部署流程。

## 工作流文件结构

本项目的 GitHub Actions 配置文件位于 `.github/workflows/test.yml`，包含以下核心组件：

### 触发条件 (on)

工作流在以下事件触发时运行：
- `push`: 代码推送到 `main` 或 `develop` 分支时
- `pull_request`: 向 `main` 或 `develop` 分支发起 Pull Request 时

### 工作任务 (jobs)

定义了一个 `build` 任务，运行在 Ubuntu 最新版本环境中。

### 策略矩阵 (strategy)

使用矩阵测试多个 Node.js 版本：
- Node.js 18.x
- Node.js 20.x

### 执行步骤 (steps)

1. **Checkout code**: 拉取仓库代码
2. **Use Node.js**: 设置 Node.js 环境并缓存依赖
3. **Install dependencies**: 安装项目依赖
4. **Lint code**: 执行 ESLint 代码检查
5. **Check formatting**: 检查代码格式化
6. **Build project**: 构建项目

## 配置步骤

### 1. 创建工作流文件

在项目根目录创建 `.github/workflows/test.yml` 文件：

```yaml
name: CI/CD Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Build project
        run: npm run build
```

### 2. 推送到 GitHub

将配置文件推送到 GitHub 仓库：

```bash
git add .github/workflows/test.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### 3. 查看运行结果

登录 GitHub 仓库，点击顶部的 **Actions** 标签页，即可查看工作流的运行状态和结果。

## 常见问题

### Q1: 工作流运行失败

**原因分析**:
- 依赖安装失败
- 代码检查未通过
- 构建失败

**解决方案**:
1. 查看工作流日志，定位失败步骤
2. 根据错误信息修复代码或配置

### Q2: 如何跳过工作流运行

在 commit message 中添加 `[skip ci]` 或 `[ci skip]`：

```bash
git commit -m "Update README [skip ci]"
```

### Q3: 如何只在特定分支运行

修改 `on.push.branches` 或 `on.pull_request.branches` 配置：

```yaml
on:
  push:
    branches: [ main ]
```

### Q4: 如何添加更多测试步骤

在 `steps` 中添加新的步骤：

```yaml
steps:
  - name: Run tests
    run: npm test
```

## 扩展功能建议

### 添加测试覆盖率报告

```yaml
- name: Run tests with coverage
  run: npm test -- --coverage
```

### 添加部署步骤

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### 添加 Slack 通知

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    channel-id: '#ci-cd'
    slack-message: 'Build completed successfully!'
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

## 参考文档

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitHub Actions 语法参考](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
