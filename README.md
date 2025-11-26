# eSIM 管理工具（核心版） <sub>v1.0.4 · core</sub>

跨平台可复用的核心前端（React），用于管理 eSIM 配置、设备、卡片、EID，支持导入/导出与隐私/UID 控制。本分支移除了 uTools 专有清单与 preload，仅保留通用 UI/逻辑，方便后续合并到 Web/Mac 等项目。
## 图片展示
![undefined](https://m.360buyimg.com/i/jfs/t1/353365/24/18478/280123/69264633F60ee7cd2/402514907542f050.png)
![undefined](https://m.360buyimg.com/i/jfs/t1/367488/39/5264/273325/69264631F3440fbc2/071799e99e2bfe05.png)
![undefined](https://m.360buyimg.com/i/jfs/t1/367811/29/6220/243974/6926463eFba72d304/592ea438d987ba98.png)

- 解锁问题：“本工具首发于哪个论坛？”。如需无锁或其他策略，可下载 trial 发布包：<https://github.com/Yeats33/esim-manager/releases>
- “重置全部”同时清理本地布局偏好、解锁标记与充值模板缓存，完全回到初始状态。

## 主要功能
- 配置管理：新增/编辑/删除，字段包含号码/国家区号/APN/流量短信语音（单位+周期）/备注/Aff 链接等。
- 层级管理：设备/卡片/EID 可新增、编辑、删除、展开查看子项，支持移动 Profile、UID 显示开关、隐藏未指定占位。
- 隐私模式：EID 与号码可按首尾保留中间打码。
- 导入/导出：单条/全量导出 JSON；从文件导入（uTools 文件对话框）。
- 主题与展示：简略/非空/全部视图切换；明暗主题；版权信息（`public/credits.html`）内置中英文折叠。

## 项目结构（核心可复用）
```
├─ src/ESIM/index.jsx       # 核心前端（React）：设备/卡/EID/配置管理、模板、解锁、布局偏好等（可复用到 Web/Mac）
├─ public/credits*.html     # 版权与许可（中英，可复用）
├─ public/logo.png          # 插件图标（可复用）
├─ .github/scripts/compare_version.py   # 版本比较脚本（通用）
├─ package.json / vite.config.js / README.md ...
└─ dist/                        # 构建产物（build 后生成）
```
**跨平台可复用**：`src/ESIM/index.jsx`（前端逻辑/UI）、`public/credits*.html`、`public/logo.png`、`.github/scripts/compare_version.py` 等。
**已移除 uTools 专用**：`public/plugin.json`、`public/preload/services.js`、uTools 发布工作流。若需要 uTools 版，请在 `main` 分支。

## 环境
- Node.js 18+ 与 npm

## 开发与调试
```bash
npm install
npm run dev
# 浏览器仅用于样式查看，完整功能需在 uTools 中加载插件目录
```
调试提示：
- 浏览器模式下无 `window.services`，会降级到 localStorage，功能有限。
- 查看 Console 以排查错误，或在 uTools 内加载插件目录进行真实环境调试。

## 构建
```bash
npm run build
# 产物在 dist/
```

## 在其他平台使用
本分支不包含 uTools preload，可直接作为 Web 前端，或接入自定义后端/桌面存储层：
1) 构建后将 dist 作为静态资源（或直接 `npm run dev` 预览）。
2) 提供与 `window.services` 兼容的存储接口，或根据需要替换为自有数据层。

## 数据存储（核心版）
- 默认会降级使用 localStorage（浏览器环境）；如需持久化到文件/数据库，请自行实现 `window.services` 兼容接口。
- “未指定”占位按设备独立（none card/eid）。

## 版权与许可
- 见 `public/credits.html`（中英双语可折叠）：CC BY-NC-SA 4.0，非商业使用，商业需联系作者。

## 常见命令
```bash
npm run dev      # 开发
npm run build    # 构建
```

## 更新日志
- 2025-11-25：新增 UID 全局开关、隐私模式、类型筛选、独立版权 HTML；设备专属未指定占位；多字段配置表单。

## Release 1.0.0
- Title: eSIM 管理工具 v1.0.0
- Notes:
  - 全量 eSIM 配置/设备/卡片/EID 管理，含隐私打码与 UID 显示切换。
  - 导入/导出 JSON，设备专属“未指定”占位，类型筛选与隐藏未指定开关。
  - 配置字段扩展：号码/区号/APN/流量短信语音（单位+周期）/备注/Aff 链接。
  - 版权信息改用 `public/credits.html`（中英可折叠），许可 CC BY-NC-SA 4.0。

## Release 1.0.1
- Title: eSIM 管理工具 v1.0.1
- Notes:
  - 使用/充值弹窗新增“延长/重置有效期”模式，可从今天重置 +N 天或在当前有效期上延长。
  - preload 增加 `resetEsimValidityFromToday` 接口，支持重置有效期。

## Release 1.0.2
- Title: eSIM 管理工具 v1.0.2
- Notes:
  - 内部迭代版本，用于多分支/多发布流准备与锁配置清理。

## Release 1.0.3
- Title: eSIM 管理工具 v1.0.3
- Notes:
  - 顶部按钮支持“布局设置”自定义显示/隐藏（重置、导入导出、示例生成/删除、复制示例 JSON、UID/隐私/主题开关），并持久化到本地。
  - 示例生成会附带示例充值模板；新增“删除示例配置”按钮。
  - 使用/充值支持每个配置单独的模板保存/加载，并导出时包含模板 JSON。
  - 锁定解锁记忆、本地模版字段等细节完善。

## Release 1.0.4
- Title: eSIM 管理工具 v1.0.4
- Notes:
  - GitHub Actions 自动发布调整：main 每次发布；trial 仅在补丁号为偶数；nolock 仅在补丁号为 5 的倍数，并标记为预发布，保证 main 是最新正式版。
  - uTools 打包修正：.upx 包含 plugin.json 和 credits 资源，从 build 目录整体打包，确保官方识别。
  - 引入独立版本比较脚本，自动跳过低于已发布版本的构建。
  - “重置全部”增加本地缓存清理（布局偏好、解锁标记、充值模板），恢复出厂状态更彻底。
