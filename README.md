# eSIM 管理工具（uTools 插件） <sub>v1.0.2 · main</sub>

开源的 uTools 插件，帮助管理 eSIM 配置、设备、卡片、EID，支持导入/导出、本地存储与隐私/UID 控制。基于 Vite + React。
## 图片展示
![undefined](https://m.360buyimg.com/i/jfs/t1/353365/24/18478/280123/69264633F60ee7cd2/402514907542f050.png)
![undefined](https://m.360buyimg.com/i/jfs/t1/367488/39/5264/273325/69264631F3440fbc2/071799e99e2bfe05.png)
![undefined](https://m.360buyimg.com/i/jfs/t1/367811/29/6220/243974/6926463eFba72d304/592ea438d987ba98.png)
## 注意
- 锁策略可配置：`.config/lock.config.json` 定义各 profile 的锁定规则，默认 profile 为 `main`，可通过环境变量 `VITE_LOCK_PROFILE` 指定（如 `trial` 为 10 分钟后锁，`nolock` 不锁）。
- 解锁问题：“本工具首发于哪个论坛？”。如需无锁或其他策略，可切换对应 profile/分支或下载 trial 发布包：<https://github.com/Yeats33/esim-manager/releases>

## 主要功能
- 配置管理：新增/编辑/删除，字段包含号码/国家区号/APN/流量短信语音（单位+周期）/备注/Aff 链接等。
- 层级管理：设备/卡片/EID 可新增、编辑、删除、展开查看子项，支持移动 Profile、UID 显示开关、隐藏未指定占位。
- 隐私模式：EID 与号码可按首尾保留中间打码。
- 导入/导出：单条/全量导出 JSON；从文件导入（uTools 文件对话框）。
- 主题与展示：简略/非空/全部视图切换；明暗主题；版权信息（`public/credits.html`）内置中英文折叠。

## 项目结构
- `public/credits.html`：版权与许可（中英折叠，CC BY-NC-SA 4.0 非商业）。
- `public/preload/services.js`：uTools preload，文件存储、设备/卡片/EID/配置 CRUD、迁移与重置。
- `src/ESIM/index.jsx`：主界面与业务逻辑。
- 其他：`plugin.json`（入口词/开发地址）、`vite.config.js` 等。

## 环境
- Node.js 18+ 与 npm
- uTools（运行与调试插件）

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

## 在 uTools 中使用
1) 构建后将 dist 作为插件目录（或复制到任意目录包含 index.html、plugin.json、preload 等）。
2) uTools → 加载已解压插件 → 选择目录。
3) 在插件内使用导入/导出/管理功能。

## 数据存储
- 插件环境：`public/preload/services.js` 将数据保存到用户 Downloads 目录的 `esim_profiles.json`。
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
  - 顶部按钮支持“布局设置”自定义显示/隐藏（重置、导入导出、示例生成/删除、复制示例 JSON、UID/隐私/主题开关），并持久化到本地。
  - 示例生成会附带示例充值模板；新增“删除示例配置”按钮。
  - 使用/充值支持每个配置单独的模板保存/加载，并导出时包含模板 JSON。
  - 锁定解锁记忆、本地模版字段等细节完善。
