# Qreate Privacy Policy · Qreate 隐私政策

**Effective date · 生效日期：2026-09-23**

Qreate is an open-source Chrome extension that turns the current page URL —
or any text you type — into a QR code. Everything runs locally on your
device; there is no server, no analytics, no tracking, no ads, and no
account.

Source: <https://github.com/aidyou/qreate>

## The short version

**Qreate collects no personal data.** It runs entirely inside your browser,
makes **zero network requests**, and has no server of any kind. Everything
you see is generated locally on your device and disappears when you close
the popup or overlay.

## Information handled locally (never transmitted)

- **Page URL of the active tab.** Read only when you explicitly click the
  toolbar icon or use the right-click menu (Chrome `activeTab` permission),
  and used only to draw the QR code in the popup or overlay. It is never
  stored or sent anywhere.
- **Text you type into the popup input.** Encoded into a QR code on the
  spot; never stored or transmitted.
- **One preference: the “Generate page QR” context-menu toggle.** Stored
  via `chrome.storage.sync`, which Chrome may sync between your own
  signed-in devices. It contains nothing other than this on/off setting.

## What Qreate does *not* do

- Collect, process, or transmit personal data or identifiable information.
- Make any network request. The extension declares no host permissions and
  its Content Security Policy restricts scripts to the extension package
  itself.
- Track browsing history, behavior, or usage analytics.
- Sell, share, or rent any data — there is none to share.

## Data deletion

Qreate stores nothing on servers, so there is nothing for us to delete. The
single synced preference is removed as soon as you uninstall the extension,
or you can clear all Chrome sync data from `chrome://settings`.

## Changes to this policy

If this policy changes, the effective date above is updated and the new
version is published in this file in the extension's source repository.

## Contact

Questions about this policy? Open an issue at
<https://github.com/aidyou/qreate/issues>.

---

以下为中文版本

---

# 隐私政策（简体中文）

## 简要说明

**Qreate 不收集任何个人数据。** 它完全在你的浏览器内部运行，**不发起任何网络
请求**，也没有任何服务器。你看到的一切都在本设备本地生成，关闭弹窗或浮层后即
消失。

## 仅在本地处理、绝不传输的信息

- **当前标签页的网址。** 仅在你主动点击工具栏图标或使用右键菜单时读取
  （Chrome `activeTab` 权限），且仅用于在弹窗或浮层中绘制二维码，不会被存储
  或发送到任何地方。
- **你在弹窗输入框中输入的文本。** 即时编码为二维码，不存储、不传输。
- **一项偏好设置：右键菜单“生成页面二维码”开关。** 通过
  `chrome.storage.sync` 保存，Chrome 可能在你自己登录的设备之间同步该项设置。
  其中不包含任何其他内容。

## Qreate 绝不会做的事

- 收集、处理或传输个人数据或可识别信息。
- 发起任何网络请求。扩展未声明任何主机权限，内容安全策略（CSP）将脚本限制为
  扩展包自身。
- 追踪浏览历史、行为或使用统计。
- 出售、共享或出租任何数据——因为没有数据可共享。

## 数据删除

Qreate 不在任何服务器上存储数据，因此不存在需要删除的远端数据。唯一的同步
偏好设置会在你卸载扩展后立即移除；你也可以在 `chrome://settings` 中清除
Chrome 的全部同步数据。

## 政策变更

若本政策发生变更，将更新文件顶部的生效日期，并同步发布在本仓库的
`PRIVACY.md` 中。

## 联系我们

对本政策有任何疑问，请在
<https://github.com/aidyou/qreate/issues> 提交 issue。
