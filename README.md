# eSIM 管理工具

这是一个用于演示与管理 eSIM 配置（本地模拟）的插件前端项目，基于 Vite + React，适配 uTools 插件结构。

- 主要功能（当前实现）
- 列表 / 添加 / 删除 eSIM 配置（在 uTools 环境中使用 `public/preload/services.js` 的文件存储）。
- 从文件导入（uTools 环境支持选择文件导入）。
- 导出单条或全部配置为 JSON 文件。

项目结构要点
- `public/plugin.json`：插件元数据（入口词、preload 路径等）。
- `public/preload/services.js`：uTools preload 脚本，包含文件读写与 eSIM 存储接口（生产/插件环境使用）。
- `src/`：前端源码（主要关注 `src/ESIM/index.jsx`、`src/main.jsx`）。

前提
- Node.js（建议 18+）与 npm

安装依赖
```bash
npm install
```

说明：本项目依赖 uTools 的 preload 提供的 `window.services` 接口。在浏览器中直接运行（`npm run dev`）时，preload 不可用，页面可能无法正常工作或会显示错误提示。请在 uTools 中加载插件目录进行完整测试。
如果需要在 uTools 中调试本地 dev 服务器，可以在 `public/plugin.json` 的 `development.main` 设置为 `http://localhost:5173`，但请注意 preload 脚本在此模式下通常仍不可用，某些功能需要在真正的 uTools 插件环境中测试。
```bash
npm run dev
# 打开 http://localhost:5173/ 查看
```

说明：开发模式下浏览器环境没有 uTools 提供的 `window.services`（preload），组件已提供降级 fallback：
- 当 `window.services` 不存在时使用 `localStorage` 存储（键名 `esim_profiles_fallback`），并显示“开发模式”提示。

-- 可在 Console 运行基本排查命令：
```js
document.getElementById('root')
typeof window.services
window.services && Object.keys(window.services || {})
```
如果页面空白或报错
- 首先打开浏览器 DevTools（Cmd+Option+I），查看 Console 的错误信息。
- 可在 Console 运行：
```js
document.getElementById('root')
typeof window.services
window.services && Object.keys(window.services || {})
localStorage.getItem('esim_profiles_fallback')
```

生产构建
```bash
npm run build
# 构建产物在 dist/ 目录
```

准备 uTools 插件目录（手动）
1. 创建插件临时目录并拷贝构建产物：
```bash
rm -rf build/plugin
mkdir -p build/plugin
cp -R dist/* build/plugin/
```
2. 确认 `build/plugin` 中包含 `index.html`、`preload/services.js`、`plugin.json` 等文件。
3. 在 uTools 中选择“加载插件目录”，指向 `build/plugin`。

可选：打包为 zip
```bash
cd build
zip -r esim-plugin.zip plugin
```

数据存储说明
- uTools/插件环境：`public/preload/services.js` 将数据保存到用户 `Downloads` 目录下的 `esim_profiles.json`。

调试与日志
- 已添加 `ErrorBoundary`（`src/components/ErrorBoundary.jsx`），会在页面上显示运行时错误，便于调试。
- 在 uTools 环境，preload 脚本可直接使用 Node.js 文件 API（`fs` / `path`）。

后续改进建议
- 在 UI 中增加条目编辑表单（代替 prompt）。
- 支持更严格的导入格式与校验（例如 SM-DP+ 链接或运营商提供的配置格式）。
- 增加加密存储或权限管理（如果需要保存敏感信息）。
- 添加自动打包脚本（把 build 后内容复制并 zip，加入 `package.json` script）。

我可以继续：
- 把打包脚本加入 `package.json`（`package:plugin`），并生成一个示例 `build/plugin`；
- 把“编辑条目”表单实现为模态对话框；
- 或根据你的需求添加更严格的导入导出格式支持。

如果你需要我现在执行其中一项，请告诉我优先级。

---
最后更新：2025-11-25
