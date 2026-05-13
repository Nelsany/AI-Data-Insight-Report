# ReviewLens Backend（Fastify + Prisma + BullMQ）

此后端用于配合你的前端产品完成端到端闭环：
`/api/parse` → `/api/tasks` → `/api/tasks/:id/data` → `/api/tasks/:id/run` → `/api/reports/:id`

首期范围（与你 PRD 一致）：
- 平台：淘宝
- 输入：自然语言任务 + 评论数据文件（CSV/XLSX/JSON；SQL 导出建议转 CSV）
- 类目：香水 / 口红 / 面膜
- 报告：默认分享链接（前端 `/reports/:id`）
- 任务编排：import → analyze → report（异步队列）

> 重要说明：首期**不做任何平台爬虫/抓取**，避免风控与不可控性；系统只负责把你导出的评论数据导入后进行分析并生成报告。

---

## 1) 依赖
- Node.js 18+（建议 20）
- PostgreSQL + Redis（二者其一：云服务 or 自建）

---

## 2) 快速开始

### 2.1 启动 Postgres + Redis
你有两种方式：

**方式 A：用云服务（推荐线上）**
- RDS PostgreSQL
- ApsaraDB Redis

把连接串填到 `.env` 的 `DATABASE_URL` / `REDIS_URL` 即可。

**方式 B：同机 Docker（适合快速试跑）**
```bash
docker compose up -d
```

### 2.2 配置环境变量
```bash
cp .env.example .env
```

如需接入 LLM（OpenAI 兼容）：
- `LLM_BASE_URL`：例如 `https://api.openai.com/v1` 或你的网关
- `LLM_API_KEY`
- `LLM_MODEL`
> 注意：请勿将你的 LLM URL、模型名、密钥等隐私信息提交到 git。

### 2.3 安装依赖
```bash
npm i
```

### 2.4 初始化数据库
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 2.5 启动后端（含 worker）
```bash
npm run dev
```

默认端口：`http://localhost:4000`  
Swagger：`http://localhost:4000/docs`

---

## 3) 与前端联调方式

你的前端现在是同域 `/api/*` 调 Next.js API（或 mock）。要切到独立后端有两种方式：

### 方式 A：前端通过 Next.js 反代（推荐）
在 Next.js 增加 `rewrites()`，把 `/api/*` 代理到 `http://localhost:4000/api/*`。

### 方式 B：前端直接请求后端域名
前端把 fetch 改为绝对路径（或读环境变量 `NEXT_PUBLIC_API_BASE`）。

后端已默认开启 CORS：`FRONTEND_ORIGIN=http://localhost:3000`

---

## 3.1 阿里云 ECS（Alibaba Cloud Linux 3）部署提示（最短路径）
> 仅提供通用步骤；不同公司安全基线/运维规范可能不同。

1) 安装 Node.js（建议 20）与 git  
2) 配置 `.env`：  
   - `DATABASE_URL` 指向 RDS 或同机 Postgres  
   - `REDIS_URL` 指向 Redis  
   - LLM：`LLM_BASE_URL/LLM_MODEL/LLM_API_KEY`（不要提交到 git）  
3) 初始化 DB：  
```bash
npx prisma generate
npx prisma migrate deploy
```
4) 启动（MVP 简化：同进程启动 API + worker）：  
```bash
npm run build
npm run start
```
5) 健康检查：`/healthz`；接口文档：`/docs`

---

## 4) 你需要提供/确认的信息（真实上线前必需）

### A. LLM 配置（你已确认 OpenAI 兼容）
请给我：
- baseUrl（是否带 `/v1`）
- model 名称
- 是否需要额外 header（部分网关用 `x-api-key` 或自定义）

### B. 数据导入字段（首期必须明确）
请你确认导出的评论数据是否至少包含：
1. 评论内容（必需）
2. 评分（可选，但建议有）
3. 评论时间（可选，但建议有）
4. 追评/规格/点赞数/商品链接（可选）

### C. 合规与隐私
- 评论是否需要脱敏落库？
- 原文留存多久？是否允许导出？

---

## 5) 数据导入说明（首期核心）

### 5.1 上传接口
`POST /api/tasks/:id/data`（multipart）
- 字段名：`file`
- 支持：`.csv` / `.tsv` / `.xlsx` / `.xls` / `.json`

你可以直接用仓库内示例文件做联调：
- `examples/sample-comments.csv`

### 5.2 字段映射（允许中英文列名）
最少只需要一列“评论内容”，其余可选：
- 内容：`content` / `正文` / `内容` / `评论` / `comment` / `评价内容`
- 评分：`rating` / `评分` / `星级` / `score`
- 时间：`commentAt` / `date` / `时间` / `日期` / `发表时间` / `createdAt`
- 追评：`appendContent` / `追评` / `追加评论` / `append`
- 规格：`sku` / `规格` / `型号` / `色号`
- 点赞数：`likeCount` / `点赞数` / `赞` / `useful` / `helpful`
- 商品链接（可选）：`productUrl` / `商品链接` / `链接` / `url`
- 商品标题（可选）：`productTitle` / `商品标题` / `标题` / `title` / `商品`

> 重新上传会覆盖该任务下已导入的数据（MVP 行为）。
