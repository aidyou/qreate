# Qreate

*极简美观的二维码生成器（Chrome 扩展）*

[English](README.md)

Qreate 一键把当前页面——或任意文字——变成二维码。全部在你的浏览器本地完成：
没有服务器、不发网络请求、不做任何追踪。

## 功能特性

- **即开即用的弹窗** — 点击工具栏图标，当前页面网址已自动生成；修改输入框内容
  即可为任意文字生成二维码（输入时自动更新）。
- **右键浮层** — 在右键菜单启用 *“生成页面二维码”* 后，可在页面上直接弹出毛玻璃
  二维码卡片；按 Esc、点击遮罩或关闭按钮即可消失。
- **受限页面兜底** — 在禁止脚本注入的页面（`chrome://`、应用商店等）会改为弹出一
  个独立的小窗口展示二维码。
- **矢量输出** — 二维码以 SVG 渲染，任意缩放都保持清晰。
- **隐私优先** — manifest 不申请任何站点权限，零网络请求，全部由内置二维码库在
  本地生成。
- **双语界面** — 支持英文与简体中文，自动跟随浏览器语言。
- **偏好同步** — 右键菜单开关通过 `chrome.storage.sync` 保存，跟随 Chrome 账号
  同步。

## 安装（开发者模式加载）

1. 克隆或下载本仓库。
2. 打开 `chrome://extensions`，开启右上角**开发者模式**。
3. 点击**加载已解压的扩展程序**，选择本目录。
4. 将 Qreate 图标固定到工具栏。

需要 **Chrome 102+**（Manifest V3）。

## 使用方法

| 操作 | 方式 |
| --- | --- |
| 为当前页面 / 任意文字生成二维码 | 点击工具栏图标，按需修改输入框 |
| 在页面上弹出二维码浮层 | 右键任意位置 → **生成页面二维码** |
| 开启 / 关闭右键菜单项 | 在弹窗中切换**右键菜单**开关 |

## 项目结构

```
qreate/
├── manifest.json          # MV3 清单
├── background.js          # service worker：右键菜单 + 浮层注入
├── lib/qrcode.js          # 内置二维码生成库（Kazuhiko Arase，MIT）
├── content/overlay.js     # 页面浮层卡片（Shadow DOM 隔离样式）
├── popup/                 # 工具栏弹窗（HTML / CSS / JS）
├── _locales/              # 多语言文案（en、zh_CN）
├── icons/                 # icon.svg（设计源文件）+ 生成的 PNG
└── scripts/               # 构建期图标工具（Node）
```

## 权限说明

| 权限 | 用途 |
| --- | --- |
| `contextMenus` | 向右键菜单添加“生成页面二维码”项 |
| `storage` | 跨设备同步右键菜单开关偏好 |
| `activeTab` | 在用户主动操作时读取当前标签页网址并注入浮层 |
| `scripting` | 向页面注入 `lib/qrcode.js` 与 `content/overlay.js` |

不申请任何 `host_permissions`；除了你主动操作的当前标签页，扩展无法触达其他网站。

## 开发

构建期工具仅有图标生成。`icons/icon.svg` 是唯一设计源文件：手动编辑后重新生成
PNG 即可。

```sh
npm install
npm run generate-icons        # icons/icon.svg -> icon{16,32,48,128}.png
node scripts/verify-icons.mjs # 以 ASCII 像素预览生成结果
```

栅格化使用 [`@resvg/resvg-wasm`](https://github.com/yisibl/resvg-js)；图标中的
`Q` 字形使用 DejaVu Sans Bold（内置于 `scripts/fonts/`）。

> 提示：16px（工具栏尺寸）下细线条与亚像素细节会发糊。若小图标看起来模糊，
> 应在该尺寸改用实心图形，而不是直接缩小大尺寸设计。

## 隐私

Qreate 不收集任何个人数据，也不发起任何网络请求——一切均在本地完成。完整隐私
政策（英文 + 简体中文）位于 [`PRIVACY.md`](PRIVACY.md)。Chrome 应用商店后台
可直接填写 GitHub 渲染页面网址
<https://github.com/aidyou/qreate/blob/main/PRIVACY.md>，无需另行部署。

## 第三方组件

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
  （Kazuhiko Arase）— MIT 许可证（内置为 `lib/qrcode.js`）。
- **DejaVu 字体**（Bitstream Vera / Arev 许可证）— 仅用于构建期渲染扩展图标。
- [@resvg/resvg-wasm](https://github.com/yisibl/resvg-js) — MIT 许可证，
  仅开发依赖。
