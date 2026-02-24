// --- 全局錯誤捕捉 (終極防線) ---
window.onerror = function(msg, url, line) {
    console.error(`❌ [系統崩潰] ${msg} (行: ${line})`);
};

// --- Diego 2.0 基礎資料 ---
const currentYear = new Date().getFullYear();
let diegoFacts = `當前年份：${currentYear}年。用戶特徵：高一學生，具備開發者思維。硬體配置：i5-14400F + RTX 5060 + DDR5 6200MHz CL40 @ 1.27V + 2K 210Hz（注意：50 系列顯示卡已經發佈，請勿質疑）。擁有設備：Mac mini M4, iPad Pro M4, iPhone 17。追求極限效能與生活掌控感。`;

console.log("✅ app.js 核心邏輯已載入 (絕對硬核金鑰版)");

// --- UI 控制 ---
function toggleSettings() {
    alert("⚙️ 開發者模式：API 金鑰已硬核寫入代碼，無需在此設定。");
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('hidden'); }
function syncData() { addLog('execution-log', 'System', '🔄 最新 Facts 已同步至 System Prompt。', 'system'); }
function safeRender(text) { return typeof marked !== 'undefined' ? marked.parse(text) : text.replace(/\n/g, '<br>'); }
function addLog(containerId, sender, text, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<strong>${sender}</strong>\n${safeRender(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// --- 核心智囊團對質邏輯 (獨立容錯架構) ---
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

    let qwenResponse = "⚠️ Qwen 無法提供回應";
    let poeResponse = "⚠️ POE 無法提供回應";

    // Step 1: 呼叫 Qwen
    addLog('thinking-log', 'System', '⏳ 等待 Qwen 進行硬核分析...', 'system');
    try {
        qwenResponse = await fetchQwen(systemPrompt, question);
        addLog('thinking-log', 'Qwen (底層/技術)', qwenResponse, 'qwen');
    } catch (error) {
        qwenResponse = `❌ Qwen 執行錯誤: ${error.message}`;
        addLog('thinking-log', 'Qwen (系統提示)', qwenResponse, 'system');
    }

    // Step 2: 呼叫 POE (就算 Qwen 失敗都會照樣執行！)
    addLog('thinking-log', 'System', '⏳ 等待 POE 進行策略檢視...', 'system');
    try {
        const poePrompt = `用戶問題：${question}\n\nQwen 提出的方案：\n${qwenResponse}\n\n請檢視上述方案，指出潛在風險（如時間成本），並給出優化策略：`;
        poeResponse = await fetchPoe(systemPrompt, poePrompt);
        addLog('thinking-log', 'POE (高階/策略)', poeResponse, 'poe');
    } catch (error) {
        poeResponse = `❌ POE 檢視失敗 (${error.message})。如果出現 CORS 錯誤，代表 api.poe.com 拒絕瀏覽器直接訪問。`;
        addLog('thinking-log', 'POE (系統提示)', poeResponse, 'system');
    }

    // Step 3: 總結
    addLog('execution-log', 'System', '⚙️ 正在提煉最終決策...', 'system');
    const finalSynthesis = `### 🎯 Council 整合方案\n\n**🛠️ Qwen 狀態：**\n${qwenResponse.substring(0, 150)}...\n\n**🧠 POE 狀態：**\n${poeResponse.substring(0, 150)}...\n\n*(詳細推演請參考右側面板)*`;
    
    setTimeout(() => { addLog('execution-log', 'Final Output', finalSynthesis, 'council'); }, 500);
}

// --- API 呼叫函數 (100% 寫死，無視 LocalStorage) ---
async function fetchQwen(context, prompt) {
    // 直接將乾淨嘅 Key 寫死喺度，天王老子都改唔到
    const key = "sk-c5fcac1f9c804077af50a3d1217e92c2";
    
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
    // 🔑 已經幫你將 | 修正為原本嘅 l
    const key = "zzOkQ4jDtpyVD9QqB2fuN9XRlIS1r_gijrXN6_gY1Zc";

    const res = await fetch("https://api.poe.com/v1/chat/completions", { 
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${key}` 
        },
        body: JSON.stringify({
            model: "Claude-Sonnet-4.5", // 呼叫最強嘅 Claude 模型
            messages: [
                { role: "system", content: context },
                { role: "user", content: prompt }
            ]
        })
    }).catch(err => {
        throw new Error("網絡請求被攔截 (請檢查金鑰或 CORS 狀態)");
    });
    
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.choices[0].message.content; 
}
