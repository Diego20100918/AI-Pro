// --- 全局錯誤捕捉 (終極防線) ---
window.onerror = function(msg, url, line) {
    console.error(`❌ [系統崩潰] ${msg} (行: ${line})`);
};

// --- Diego 2.0 基礎資料 ---
let diegoFacts = "用戶特徵：高一學生，具備開發者思維。硬體配置：i5-14400F + RTX 5060 + DDR5 6200MHz CL40 @ 1.27V + 2K 210Hz。追求極限效能與生活掌控感的平衡。";

console.log("✅ app.js 核心邏輯已載入");

// --- 初始化與設定 ---
window.onload = () => {
    try {
        if(localStorage.getItem('qwen_key')) document.getElementById('qwen-key').value = localStorage.getItem('qwen_key');
        if(localStorage.getItem('poe_key')) document.getElementById('poe-key').value = localStorage.getItem('poe_key');
        console.log("✅ LocalStorage 讀取成功");
    } catch (e) {
        console.error("讀取 Keys 失敗", e);
    }
};

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function saveKeys() {
    localStorage.setItem('qwen_key', document.getElementById('qwen-key').value.trim());
    localStorage.setItem('poe_key', document.getElementById('poe-key').value.trim());
    toggleSettings();
    alert("金鑰已安全儲存！");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function syncData() {
    addLog('execution-log', 'System', '🔄 最新 Facts (14400F, RAM 時序等) 已同步至 System Prompt。', 'system');
}

// --- 安全渲染 Markdown ---
function safeRender(text) {
    if (typeof marked !== 'undefined') {
        return marked.parse(text);
    }
    // 如果 marked.js 載入失敗，退回純文字顯示，防止報錯
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
    
    // 展開右側面板
    const thinkingPanel = document.getElementById('thinking-panel');
    if (thinkingPanel) thinkingPanel.classList.add('active');
    document.getElementById('thinking-log').innerHTML = '';

    const systemPrompt = `${diegoFacts} 你現在是 Diego 的專屬 AI 智囊團。請根據他的硬體與開發者背景提供精準建議。`;

    try {
        // Step 1: Qwen
        addLog('thinking-log', 'System', '⏳ 等待 Qwen 進行硬核分析...', 'system');
        const qwenResponse = await fetchQwen(systemPrompt, question);
        addLog('thinking-log', 'Qwen (底層/技術)', qwenResponse, 'qwen');

        // Step 2: POE
        addLog('thinking-log', 'System', '⏳ 等待 POE 進行策略檢視...', 'system');
        const poePrompt = `用戶問題：${question}\n\nQwen 提出的方案：\n${qwenResponse}\n\n請檢視上述方案，指出潛在風險（如時間成本），並給出優化策略：`;
        const poeResponse = await fetchPoe(systemPrompt, poePrompt);
        addLog('thinking-log', 'POE (高階/策略)', poeResponse, 'poe');

        // Step 3: 總結
        addLog('execution-log', 'System', '⚙️ 正在提煉最終決策...', 'system');
        const finalSynthesis = `### 🎯 Council 整合方案\n\n**🛠️ Qwen 技術要點：**\n${qwenResponse.substring(0, 180)}...\n\n**🧠 POE 策略優化：**\n${poeResponse.substring(0, 180)}...\n\n*(詳細推演請參考右側面板)*`;
        
        setTimeout(() => {
            addLog('execution-log', 'Final Output', finalSynthesis, 'council');
        }, 500);

    } catch (error) {
        console.error("執行過程中斷:", error);
        addLog('execution-log', 'System', `❌ 執行錯誤: ${error.message}`, 'system');
    }
}

// --- API 呼叫函數 ---
async function fetchQwen(context, prompt) {
    const key = localStorage.getItem('qwen_key');
    if (!key) throw new Error("缺少 Qwen Key，請先設定。");

    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
            model: "qwen-plus",
            messages: [
                { role: "system", content: context },
                { role: "user", content: prompt }
            ]
        })
    });
    const data = await res.json();
    if(data.error) throw new Error("Qwen API 拒絕請求: " + data.error.message);
    return data.choices[0].message.content;
}

async function fetchPoe(context, prompt) {
    const key = localStorage.getItem('poe_key');
    if (!key) throw new Error("缺少 POE Key，請先設定。");

    // 注意：這裡使用 POST 格式示意。你需要換成你之前 AI 助手的真實 POE Proxy URL。
    const res = await fetch("https://api.poe.com/bot/query", { 
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
            bot: "Claude-3-Sonnet", 
            query: `${context}\n\n${prompt}`
        })
    });
    
    const data = await res.json();
    if(!data.response) throw new Error("POE 伺服器無正確回應。請檢查 Proxy URL。");
    return data.response; 
}
