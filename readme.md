# Telegram Toolbox

<div style="text-align:center">
<img src="telegram-toolbox-docs/docs/screenshot/logo.png" style="width:50px" alt="Telegram Toolbox logo"/>
</div>

**Telegram Toolbox** 是一款`开源`监听、采集工具，帮助你在 Telegram 上捕捉潜在客户。
它会监听群组和频道消息，检测你添加的**关键词**，并即时通知你，让你更容易发现和联系新线索，用户`无需服务器`，只要在本地电脑安装就能运行。

**Telegram Toolbox** is a smart & free tool that helps you capture potential customers on Telegram.  
It listens to group and channel messages, detects **keywords** you care about, and notifies you instantly — making it
easier to discover and connect with new leads.

<p style="text-align:center">
<a href="./readme_zh.md" target="_blank">
<img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87%E7%89%88-e71b24?&color=e71b24&sanitize=true" alt="Chat"/>
</a>

<a href="./readme_ru.md" target="_blank">
<img src="https://img.shields.io/badge/Русский-e71b24?&color=0039a6&sanitize=true" alt="Chat"/>
</a>

<a href="https://t.me/tg_tool_box" target="_blank">
<img src="https://img.shields.io/badge/%40jenkins__pro-25a4e3?logo=telegram&logoColor=white&sanitize=true" alt="Chat"/>
</a>
</p>


## ⬇️ Installation
Download the latest release from the [Releases](https://github.com/yee338024/telegram-toolbox/releases)

## 🚀 Key Features  

### Keyword Monitor  

Define custom keywords and let the system automatically scan Telegram messages.
![Telegram Toolbox Screenshot](telegram-toolbox-docs/docs/screenshot/telegram-toolbox.png)

### Message Forwarding  
Forward important messages to your designated chat or group automatically.
![Telegram Toolbox Screenshot](telegram-toolbox-docs/docs/screenshot/alert.png)

### Group & Channel Finder  
Automatically collects Group & Channel information from user messages or profiles, making it easier to discover,
organize, and manage target groups for your business or community.

![Channel Finder](telegram-toolbox-docs/docs/screenshot/channel_finder.png)
---

## 🎯 Use Cases  

- **Sales & Marketing** – Discover potential buyers by tracking industry keywords.
- **Community Management** – Monitor group discussions to engage with members faster.
- **Research & Trends** – Follow conversations about products, brands, or competitors.

---

## Usage

![Login](telegram-toolbox-docs/docs/screenshot/login.png)

If you're in mainland China, you may need to configure a proxy. Enter the proxy server and port according to your proxy software's settings; if you have a system-wide (global) proxy enabled, you can skip this step.

![Proxy Settings](telegram-toolbox-docs/docs/screenshot/set_proxy.png)

Then go to `Message Monitor` → `Listener Management` and add keywords to create a listener.

![Add Listener](telegram-toolbox-docs/docs/screenshot/add_listener.png)

## Code startup

1. Clone the repository
```shell
git clone https://github.com/yee338024/telegram-toolbox.git
```
2. Install dependencies
Enter the `telegram-toolbox-client` directory
```shell
npm install
```
Enter the `telegram-toolbox-vue` directory
```shell
npm install
```
3. Start
First start the front-end, enter the `telegram-toolbox-vue` directory
```shell
npm run dev
```
Then start electron, enter the `telegram-toolbox-client` directory
```shell
npm run dev
```
