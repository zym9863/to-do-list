// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展已安装');
});

// 监听扩展消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('收到消息:', message);
    sendResponse({ status: 'ok' });
});