# MVP 前端— 评论洞察一体化（导入数据模式）

本项目是基于 PRD v1.1 的 **前端 MVP**：
- 工作台：最近任务 + 示例指令
- 新建任务：自然语言输入 → 参数解析（后端 /api/parse）→ 上传评论数据文件 → 自动触发分析
- 任务详情：三步流程（导入/分析/报告）+ 运行日志 + 刷新
- 报告页：HTML5 单页 + ECharts 图表 + 痛点/卖点证据引用展开

> 首期不做任何平台爬虫/抓取：评论数据由用户自行在外部导出（CSV/XLSX/JSON）后上传。

---

## 1) 本地运行

### 1.1 安装依赖
```bash
npm i
```

### 1.2 配置后端地址（必需）
通过环境变量指定独立后端地址（Next 会将 `/api/*` 反代到后端，同时 Server Component 也会用它直连）：
```bash
export BACKEND_URL=http://localhost:4000
```

### 1.3 启动
```bash
npm run dev
```

打开：http://localhost:3000

---

## 2) 关键目录
- `src/app/page.tsx`：工作台（服务端拉取任务列表）
- `src/app/tasks/new/*`：新建任务（包含文件上传）
- `src/app/tasks/[id]/*`：任务详情（刷新/触发分析）
- `src/app/reports/[id]/page.tsx`：分享报告页
- `src/lib/localStore.ts`：已改为“后端 API 读取封装”（保留旧文件名，便于最小改动）
