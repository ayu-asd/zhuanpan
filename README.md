<p align="center">
  <img src="public/favicon.svg" width="64" />
</p>

<h1 align="center">转盘 - 随机抽奖</h1>

<p align="center">
  一个美观的随机转盘网页应用，支持转盘管理、开奖记录、GitHub 登录与云端同步
</p>

## 功能

- **随机转盘** — Canvas 绘制扇形分段，物理减速旋转动画
- **奖项管理** — textarea 批量添加（每行一个），支持删除、清空
- **开奖结果** — 弹窗显示中奖项，支持「移除此项」或「移除此项并保存」
- **转盘管理** — 创建、加载、重命名、复制、删除转盘
- **开奖记录** — 自动记录每次开奖结果（轮盘名、奖项、时间）
- **三主题切换** — 霓虹暗色 / 复古街机 / 极简白净
- **旋转音效** — Web Audio API 合成，无需外部文件
- **GitHub 登录** — OAuth 授权登录，JWT 鉴权
- **云端同步** — 登录后数据实时同步至云端（多设备共享）
- **数据隔离** — 未登录数据存 localStorage，登录后只读写云端，互不影响
- **本地字体** — Google Fonts 已下载到项目内，完全离线可用

## 技术栈

- **框架**: Vue 3 + Vite
- **语言**: JavaScript
- **渲染**: HTML5 Canvas
- **存储**: localStorage（未登录）+ Vercel KV / Upstash（登录后）
- **鉴权**: GitHub OAuth + JWT
- **音效**: Web Audio API
- **部署**: Vercel Serverless Functions

## 启动

```bash
npm install
npm run dev      # 开发模式（热更新）
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 环境变量

在 `.env` 或 Vercel 项目中配置：

| 变量 | 说明 |
|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App 的 Client Secret |
| `JWT_SECRET` | 用于签发 / 验证 JWT 的密钥 |
| `KV_REST_API_URL` | Vercel KV REST API 地址 |
| `KV_REST_API_TOKEN` | Vercel KV REST API 令牌 |

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth` | GET | GitHub OAuth 登录 / 回调 |
| `/api/me` | GET | 获取当前登录用户信息 |
| `/api/wheels` | GET / POST | 获取 / 覆盖转盘数据 |
| `/api/history` | GET / POST | 获取 / 覆盖开奖记录 |

## 部署

已配置 Vercel 部署，推送到 `main` 分支自动构建发布。

```bash
git push origin main
```
