// --- 全局錯誤捕捉 (終極防線) ---
window.onerror = function(msg, url, line) {
    console.error(`❌ [系統崩潰] ${msg} (行: ${line})`);
};

// --- Diego 2.0 基礎資料 (修復 2026 年時間線) ---
const currentYear = new Date().getFullYear();
let diegoFacts = `當前年份：${currentYear}年。用戶特徵：高一學生，具備開發者思維。硬體配置：i5-14400F + RTX 5060 + DDR5 6200MHz CL40 @ 1.27V + 2K 210Hz（注意：50 系列顯示卡已經發佈，請勿質疑）。追求極限效能與生活掌控感。`;

// 🔑 Hardcoded 免費金鑰 (Diego 專用懶人包)
const DEFAULT_QWEN_KEY = "sk-c5fcac1f9c804077af50a3d1217e92c2";
const DEFAULT_POE_KEY = "zzOkQ4jDtpyVD9QqB2fuN9XR|IS1r_gijrXN6_gY1Zc";

console.log("✅ app.js 核心邏輯已載入 (內置金鑰版)");

// --- 初始化與設定 ---
window.onload = () => {
    try {
        // 如果 LocalStorage 冇嘢，就自動填入你畀嘅預設 Key
        document.getElementById('qwen-key').value = localStorage.getItem('qwen_key') || DEFAULT_QWEN_KEY;
        document.getElementById('poe-key').value = localStorage.getItem('poe_key') || DEFAULT_POE_KEY;
    } catch (e) {
        console.error("讀取 Keys 失敗", e);
    }
};

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function saveKeys() {
    // 🧹 終極淨化：強制剷除所有空白、換行同 Tab
    const cleanQwen = document.getElementById('qwen-key').value.replace(/\s+/g, '');
    const cleanPoe = document.getElementById('poe-key').value.replace(/\s+/g, '');
    
    localStorage.setItem('qwen_key', cleanQwen);
    localStorage.setItem('poe_key', cleanPoe);
    
    document.getElementById('qwen-key').value = cleanQwen;
    document.getElementById('poe-key').value = cleanPoe;
    
    toggleSettings();
    alert("✅ 金鑰已更新！");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function syncData() {
    addLog('execution-log', 'System', '🔄 最新 Facts (14400F, 5060, RAM 時序) 已同步至 System Prompt。', 'system');
}

// --- 安全渲染 Markdown ---
function safeRender(text) {
    if (typeof marked !== 'undefined') {
        return marked.parse(text);
    }
    return text.replace(/\n/g, '<br>'); 
}

// --- 輔助輸出函數 ---
function addLog(containerId, sender, text, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<strong>${sender}</strong>\n${safeRender(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// --- 核心智囊團對質邏輯 ---
async function runCouncil() {
    console.log("🚀 啟動 Council 流程");
    const inputField = document.getElementById('user-input');
    const question = inputField.value.trim();
    if (!question) return;

    // UI 準備
    addLog('execution-log', 'Diego', question, 'user');
    inputField.value = '';
    
    const thinkingPanel = document.getElementById('thinking-panel');
    if (thinkingPanel) thinkingPanel.classList.add('active');
    document.getElementById('thinking-log').innerHTML = '';

    const systemPrompt = `${diegoFacts} 你現在是 Diego 的專屬 AI 智囊團。請根據他的硬體與開發者背景提供精準建議。`;

    let qwenResponse = "";
    let poeResponse = "";

    try {
        // Step 1: Qwen
        addLog('thinking-log', 'System', '⏳ 等待 Qwen 進行硬核分析...', 'system');
        qwenResponse = await fetchQwen(systemPrompt, question);
        addLog('thinking-log', 'Qwen (底層/技術)', qwenResponse, 'qwen');
    } catch (error) {
        addLog('execution-log', 'System', `❌ Qwen 執行錯誤: ${error.message}`, 'system');
        return; 
    }

    try {
        // Step 2: POE
        addLog('thinking-log', 'System', '⏳ 等待 POE 進行策略檢視...', 'system');
        const poePrompt = `用戶問題：${question}\n\nQwen 提出的方案：\n${qwenResponse}\n\n請檢視上述方案，指出潛在風險（如時間成本），並給出優化策略：`;
        poeResponse = await fetchPoe(systemPrompt, poePrompt);
        addLog('thinking-log', 'POE (高階/策略)', poeResponse, 'poe');
    } catch (error) {
        console.error("POE 請求失敗:", error);
        poeResponse = `⚠️ POE 檢視失敗 (${error.message})。可能是 Proxy 設定問題。`;
        addLog('thinking-log', 'POE (系統提示)', poeResponse, 'system');
    }

    // Step 3: 總結
    addLog('execution-log', 'System', '⚙️ 正在提煉最終決策...', 'system');
    const finalSynthesis = `### 🎯 Council 整合方案\n\n**🛠️ Qwen 技術要點：**\n${qwenResponse.substring(0, 180)}...\n\n**🧠 POE 策略/狀態：**\n${poeResponse.substring(0, 180)}...\n\n*(詳細推演請參考右側面板)*`;
    
    setTimeout(() => {
        addLog('execution-log', 'Final Output', finalSynthesis, 'council');
    }, 500);
}

// --- API 呼叫函數 ---
async function fetchQwen(context, prompt) {
    // 優先使用 LocalStorage，如果冇就用 Hardcoded 嘅 Key，並過濾所有空白符號
    let key = (localStorage.getItem('qwen_key') || DEFAULT_QWEN_KEY).replace(/\s+/g, '');
    
    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${key}` 
        },
        body: JSON.stringify({
            model: "qwen-plus",
            messages: [
                { role: "system", content: context },
                { role: "user", content: prompt }
            ]
        })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function fetchPoe(context, prompt) {
    let key = (localStorage.getItem('poe_key') || DEFAULT_POE_KEY).replace(/\s+/g, '');

    const res = await fetch("https://api.poe.com/bot/query", { 
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
            bot: "Claude-3-Sonnet", 
            query: `${context}\n\n${prompt}`
        })
    }).catch(err => {
        throw new Error("網絡請求被攔截 (CORS 或 Proxy 無效)");
    });
    
    const data = await res.json();
    if(!data.response) throw new Error("POE 伺服器無正確回應。");
    return data.response; 
}
