// 浏览器启动时执行一次任务
chrome.runtime.onInstalled.addListener(async () => {
    console.log('浏览器启动或扩展安装，执行一次任务');
    await getGoldFromDailyMission();
});

// 也可以监听浏览器每次启动时执行任务
chrome.runtime.onStartup.addListener(async () => {
    console.log('浏览器启动，执行一次任务');
    await getGoldFromDailyMission();
});

// 创建一个每天执行一次的 alarm
chrome.alarms.create('dailyGoldTask', {
    periodInMinutes: 3 * 60,  // 每隔 3 小时执行一次任务
});

// 监听 alarm 触发事件
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dailyGoldTask') {
        console.log('定时任务触发，执行一次任务');
        await getGoldFromDailyMission();
    }
});

// 获取目标页面并提取跳转地址
async function getGoldFromDailyMission() {
    try {
        const targetUrl = 'https://www.v2ex.com/mission/daily';  // V2EX 日常任务页面

        // 使用 fetch 获取页面内容，携带 cookie（浏览器会自动附带cookie）
        const response = await fetch(targetUrl, {
            method: 'GET',
            credentials: 'same-origin',  // 确保请求携带当前浏览器的 cookies
        });

        if (response.ok) {
            const html = await response.text();  // 获取 HTML 页面内容

            let result = extractMissionURL(html)
            if (result) {
                const href = result.url;  // 提取到的跳转地址
                const baseUrl = 'https://www.v2ex.com';  // V2EX 网站的基础 URL
                const fullUrl = baseUrl + href;  // 拼接完整的 URL

                // 调用函数进行金币领取
                await claimGold(fullUrl);
            } else {
                console.log('未找到跳转地址');
            }

        } else {
            console.log('页面请求失败:', response.status);
        }
    } catch (error) {
        console.error('获取金币任务失败:', error);
    }
}

// 领取金币的函数
async function claimGold(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin',  // 确保请求携带当前浏览器的 cookies
        });

        if (response.ok) {
            const html = await response.text();  // 获取 HTML 页面内容

            // // 解析 HTML 页面内容并检查领取结果
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rewardStatus = doc.querySelector('.reward-status');  // 根据页面实际情况选择正确的选择器
            if (1) {
                console.log('金币领取状态:', rewardStatus.textContent);
            } else {
                console.log('未找到金币领取的状态,可能已领取');
            }
        } else {
            console.log('请求领取金币失败:', response.status);
        }
    } catch (error) {
        console.error('领取金币失败:', error);
    }
}

function extractMissionURL(str) {
    // 正则表达式，匹配 "/mission/daily/redeem?once=" 后面的数字
    const regex = /\/mission\/daily\/redeem\?once=(\d+)/;

    // 使用正则表达式匹配
    const match = str.match(regex);

    if (match) {
        // 返回匹配到的 URL 和数字
        return {
            url: match[0],  // 匹配到的完整 URL，如 "/mission/daily/redeem?once=80870"
            onceValue: match[1] // 匹配到的数字部分，如 "80870"
        };
    } else {
        // 如果没有匹配到，返回 null
        return null;
    }
}
