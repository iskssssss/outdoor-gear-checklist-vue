# 🚀 部署指南

> 本文档介绍如何将"户外装备清单"部署到各种平台。

## 📋 目录

- [构建准备](#构建准备)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [GitHub Pages 部署](#github-pages-部署)
- [自托管部署](#自托管部署)
- [环境变量](#环境变量)
- [性能优化](#性能优化)

---

## 📦 构建准备

### 1. 本地构建测试

```bash
# 安装依赖
npm install

# 类型检查
npm run type-check

# 构建
npm run build

# 预览构建结果
npm run preview
```

### 2. 检查构建产物

构建成功后，`dist/` 目录包含：

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (压缩文件)
└── index.html
```

---

## ☁️ Vercel 部署

### 方式一：自动部署（推荐）

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 点击 "Deploy"

### 方式二：CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 自定义域名

1. 在 Vercel 项目设置中
2. 进入 "Domains" 标签
3. 添加你的域名
4. 按照提示配置 DNS

---

## 🌐 Netlify 部署

### 方式一：Git 自动部署

1. 访问 [Netlify](https://www.netlify.com/)
2. 点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. 点击 "Deploy site"

### 方式二：拖放部署

1. 本地构建：`npm run build`
2. 访问 [Netlify Drop](https://app.netlify.com/drop)
3. 将 `dist` 文件夹拖放到页面

### 方式三：CLI 部署

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署
netlify deploy

# 生产部署
netlify deploy --prod
```

### netlify.toml 配置

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 📄 GitHub Pages 部署

### 配置 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 配置 vite.config.ts

如果部署到子路径（如 `username.github.io/repo-name`）：

```typescript
export default defineConfig({
  base: '/repo-name/',
  // ... 其他配置
});
```

### 启用 GitHub Pages

1. 进入仓库 Settings
2. 找到 Pages 设置
3. Source 选择 `gh-pages` 分支
4. 点击 Save

---

## 🏠 自托管部署

### 使用 Nginx

#### 1. 构建项目

```bash
npm run build
```

#### 2. 上传到服务器

```bash
scp -r dist/* user@your-server:/var/www/hiking-checklist/
```

#### 3. 配置 Nginx

创建 `/etc/nginx/sites-available/hiking-checklist`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/hiking-checklist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 4. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/hiking-checklist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 使用 Docker

#### Dockerfile

```dockerfile
# 构建阶段
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 构建和运行

```bash
# 构建镜像
docker build -t hiking-checklist .

# 运行容器
docker run -d -p 80:80 hiking-checklist

# 使用 docker-compose
docker-compose up -d
```

---

## 🔧 环境变量

虽然本项目主要是纯前端应用，但如果需要配置环境变量：

### .env 文件

```bash
# .env.production
VITE_APP_TITLE=户外装备清单
VITE_APP_VERSION=1.4.1
VITE_API_BASE_URL=https://api.example.com
```

### 在代码中使用

```typescript
const appTitle = import.meta.env.VITE_APP_TITLE;
const version = import.meta.env.VITE_APP_VERSION;
```

---

## ⚡ 性能优化

### 1. 构建优化

#### 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['uuid', '@vueuse/core']
        }
      }
    }
  }
});
```

#### 压缩

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
});
```

### 2. CDN 加速

使用 CDN 加速静态资源：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
});
```

在 `index.html` 中引入 CDN：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
```

### 3. 图片优化

- 使用 WebP 格式
- 压缩图片
- 使用懒加载

### 4. 缓存策略

```nginx
# Nginx 缓存配置
location ~* \.(html)$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}

location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📊 监控和分析

### Google Analytics

在 `index.html` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry 错误追踪

```bash
npm install @sentry/vue
```

```typescript
// main.ts
import * as Sentry from "@sentry/vue";

Sentry.init({
  app,
  dsn: "YOUR_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

---

## ✅ 部署检查清单

部署前确保：

- [ ] 代码已提交到 Git
- [ ] 通过类型检查 (`npm run type-check`)
- [ ] 本地构建成功 (`npm run build`)
- [ ] 预览构建正常 (`npm run preview`)
- [ ] 更新了版本号
- [ ] 更新了 CHANGELOG
- [ ] 配置了正确的 base URL（如需要）
- [ ] 添加了必要的环境变量
- [ ] 配置了 HTTPS（生产环境）
- [ ] 设置了缓存策略
- [ ] 配置了错误监控
- [ ] 测试了所有功能

---

## 🆘 常见问题

### Q: 部署后页面空白？

检查浏览器控制台错误，可能是：
- 静态资源路径错误（检查 base 配置）
- JavaScript 错误
- CORS 问题

### Q: 刷新页面 404？

需要配置服务器支持 SPA 路由：
- Nginx: `try_files $uri $uri/ /index.html;`
- Vercel/Netlify: 自动处理

### Q: 静态资源加载失败？

检查 `vite.config.ts` 中的 `base` 配置是否正确。

---

## 📚 参考资源

- [Vite 部署文档](https://cn.vitejs.dev/guide/static-deploy.html)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
- [Nginx 文档](https://nginx.org/en/docs/)

---

**部署成功后，别忘了分享你的网站！** 🎉

**Last Updated**: 2025-10-13

