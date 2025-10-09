import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    sitemap:{
        hostname: 'https://tgtoolbox.com'
    },
    srcDir: 'docs',
    head: [
        ['link', {rel: 'icon', href: '/favicon.ico'}],
        ['meta', {
            name: 'keywords',
            content:
                'tgbot, телеграм,channelfinderbot,飞机机器人,telegram toolbox, telegram bot,telegram customer acquisition, tg customer acquisition, telegram keyword monitoring, tg keyword monitoring, telegram keyword alert, tg keyword alert, telegram group scraper, tg group scraper, telegram channel monitoring, tg channel monitoring, telegram leads capture, tg leads capture, telegram marketing tool, tg marketing tool, telegram automation bot, tg automation bot, telegram 2-way bot, tg 2-way bot, 电报引流工具, 飞机引流工具, tg引流工具, 电报关键词监控, 飞机关键词监控, tg关键词监控,关键词监听, 电报群采集, 飞机群采集, tg群采集, 电报频道监听, 飞机频道监听, tg频道监听, 电报获客机器人, 飞机获客机器人, tg获客机器人, 电报营销工具, 飞机营销工具, tg营销工具, 电报关键词实时监控工具, 飞机关键词监听机器人, tg引流获客自动化工具, 电报客户获取与营销机器人, telegram tg channel & group monitoring bot, best tg telegram marketing automation tool'
        }],
        ['meta', {name: 'author', content: 'Yee'}],
        ['meta', {name: 'baidu-site-verification', content: 'codeva-w6NaJGChtA'}],
        ['link', {rel: 'alternate', hreflang: 'en', href: 'https://tgtoolbox.com/'}],
        ['link', {rel: 'alternate', hreflang: 'zh', href: 'https://tgtoolbox.com/zh/'}],
        ['script', {}, `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?95b841b21326feb52abf9132934c4e72";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`]
    ],
    title: "Telegram Toolbox",
    description: "Telegram Toolbox is a smart tool that helps you capture potential customers on Telegram.",
    locales: {
        root: {
            label: 'English',
            lang: 'en'
        },
        zh: {
            label: '中文',
            lang: 'zh',
            themeConfig: {
                nav: [
                    {text: '主页', link: '/zh/'},
                    {text: '使用教程', link: '/zh/guide'},
                    {text: '@jenkins_pro', link: 'https://t.me/jenkins_pro'}
                ],
                sidebar: [
                    {text: '简介及安装', link: '/zh/guide'},
                    {text: '监听消息', link: '/zh/listener'},
                    {text: '群组采集', link: '/zh/channel_finder'}
                ],
            }
        },
        ru:{
            label: 'Русский',
            lang: 'ru',
            themeConfig: {
                nav: [
                    {text: 'Главная', link: '/ru/'},
                    {text: 'Руководство', link: '/ru/guide'},
                    {text: '@jenkins_pro', link: 'https://t.me/jenkins_pro'}
                ],
                sidebar: [
                    {text: 'Руководство', link: '/ru/guide'},
                    {text: 'Слушатель', link: '/ru/listener'},
                    {text: 'Поиск каналов и групп', link: '/ru/channel_finder'}
                ],
            }
        }
    },
    themeConfig: {
        nav: [
            {text: 'Home', link: '/'},
            {text: 'Guide', link: '/guide'},
            {text: '@jenkins_pro', link: 'https://t.me/jenkins_pro'}
        ],
        sidebar: [
            {text: 'Guide', link: '/guide'},
            {text: 'Listener', link: '/listener'},
            {text: 'Channel & Group Finder', link: '/channel_finder'}
        ],
        socialLinks: [
            {icon: 'telegram', link: 'https://t.me/jenkins_pro'},
            {icon: 'github', link: 'https://github.com/yee338024/telegram-toolbox'}
        ]
    }
})
