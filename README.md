<p align="center">
  <img src="public/favicon.svg" width="64" />
</p>

<h1 align="center">转盘 - 随机抽奖</h1>

<p align="center">
  一个美观的随机转盘网页应用，支持转盘保存、管理、开奖记录和主题切换
</p>

## 功能

- **随机转盘** — Canvas 绘制扇形分段，物理减速旋转动画
- **奖项管理** — textarea 批量添加（每行一个），支持删除、清空
- **开奖结果** — 弹窗显示中奖项，支持「移除此项」或「移除此项并保存」
- **转盘管理** — 保存当前配置、加载已有转盘、重命名、复制、删除
- **开奖记录** — 自动记录每次开奖结果（轮盘名、奖项、时间）
- **三主题切换** — 霓虹暗色 / 复古街机 / 极简白净
- **旋转音效** — Web Audio API 合成，无需外部文件
- **数据持久化** — 所有数据存储在浏览器 localStorage
- **本地字体** — Google Fonts 已下载到项目内，完全离线可用

## 技术栈

- **框架**: Vue 3 + Vite
- **语言**: JavaScript
- **渲染**: HTML5 Canvas
- **存储**: localStorage
- **音效**: Web Audio API
- **部署**: Vercel

## 启动

```bash
npm install
npm run dev      # 开发模式（热更新）
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

直接双击 `dist/index.html` 也可运行（file:// 兼容）。

## 部署

已配置 Vercel 部署，推送到 `main` 分支自动构建发布。

```bash
git push origin main
```
