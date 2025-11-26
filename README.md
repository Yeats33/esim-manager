# eSIM 管理工具（uTools 插件）

开源的 uTools 插件，帮助管理 eSIM 配置、设备、卡片、EID，支持导入/导出、本地存储与隐私/UID 控制。基于 Vite + React。

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
- 2025-05-xx：新增 UID 全局开关、隐私模式、类型筛选、独立版权 HTML；设备专属未指定占位；多字段配置表单。
