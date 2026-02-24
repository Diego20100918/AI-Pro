// --- Diego 2.0 基礎資料 ---
let diegoFacts = "用戶特徵：高一學生，具備開發者思維。硬體配置：i5-14400F + B760M 主機板 + RTX 5060 + DDR5 6200MHz CL40 + 2K 210Hz 螢幕。追求極限效能、時間成本控制與生活掌控感。";

window.onload = () => {
    if(localStorage.getItem('qwen_key')) document.getElementById('qwen-key').value = localStorage.getItem('qwen_key');
    if(localStorage.getItem('poe_key')) document.getElementById('poe-key').value = localStorage.getItem('poe_key');
};

// --- UI 控制 ---
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function saveKeys() {
    localStorage.setItem('qwen_key', document.getElementById('qwen-key').value);
    localStorage.setItem('poe_key', document.getElementById('poe-key').value);
    toggleSettings();
    alert("金鑰已安全儲存！");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function syncData() {
    addLog('execution-log', 'System', '最新 Facts 已載入 System Prompt。', 'system');
}

// --- 核心智囊團對質邏輯 ---
async function runCouncil() {
    const inputField = document.getElementById('user-input');
    const question = inputField.value.trim();
    if (!question) return;

    // 1. UI 準備：發送問題並展開右側思考區
    addLog('execution-log', 'Diego', question, 'user');
    inputField.value = '';
    document.getElementById('thinking-panel').classList.add('active');
    document.getElementById('thinking-log').innerHTML = ''; // 清空上一輪推演

    const systemPrompt = `${diegoFacts} 你現在是 Diego 的專屬 AI 智囊團成員。請根據他的硬體與背景提供最精準的建議。`;

    try {
        // Step 1: 呼叫 Qwen (負責硬核/底層分析)
        addLog('thinking-log', 'System', '等待 Qwen (千問) 進行硬核分析...', 'system');
        const qwenResponse = await fetchQwen(systemPrompt, question);
        addLog('thinking-log', 'Qwen (底層/技術視角)', qwenResponse, 'qwen');

        // Step 2: 呼叫 POE (負責檢視與補充)
        addLog('thinking-log', 'System', '等待 POE 進行策略檢視...', 'system');
        const poePrompt = `用戶問題：${question}\n\nQwen 提出的方案：\n${qwenResponse}\n\n請檢視上述方案，指出潛在風險（如時間成本/穩定性），並給出優化策略：`;
        const poeResponse = await fetchPoe(systemPrompt, poePrompt);
        addLog('thinking-log', 'POE (高階/策略視角)', poeResponse, 'poe');

        // Step 3: 生成最終整合方案 (輸出到左側)
        addLog('execution-log', 'System', '正在提煉最終決策...', 'system');
        
        const finalSynthesis = `### 🎯 Council 整合方案\n\n**🛠️ Qwen 技術要點：**\n${qwenResponse.substring(0, 150)}...\n\n**🧠 POE 策略優化：**\n${poeResponse.substring(0, 150)}...\n\n*(請參考右側面板查看完整討論過程)*`;
        
        setTimeout(() => {
            addLog('execution-log', 'Final Output', finalSynthesis, 'council');
        }, 800);

    } catch (error) {
        addLog('execution-log', 'System', `執行錯誤: ${error.message}。請檢查 API Keys 是否正確輸入。`, 'system');
    }
}

// --- API 呼叫函數 ---

// 1. 阿里雲 DashScope (千問) - 使用 OpenAI 兼容格式
async function fetchQwen(context, prompt) {
    const key = localStorage.getItem('qwen_key');
    if (!key) throw new Error("缺少 Qwen API Key");

    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "qwen-plus", // 建議使用 qwen-plus，性價比最高
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

// 2. POE API (請根據你之前 AI 助手專案的實際 Proxy URL 修改)
async function fetchPoe(context, prompt) {
    const key = localStorage.getItem('poe_key');
    if (!key) throw new Error("缺少 POE API Key");

    // 注意：這裡使用標準的 POST 格式示意。
    // 如果你之前是用特定的 POE API Proxy，請把 URL 換成你的 Proxy 地址
    const res = await fetch("https://api.poe.com/bot/query", { // <-- 替換為你的真實 POE Endpoint
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${key}` 
        },
        body: JSON.stringify({
            bot: "Claude-3-Sonnet", // 可自由修改你要調用的 POE 機器人
            query: `${context}\n\n${prompt}`
        })
    });
    
    // 假設 Proxy 返回的結構是 { response: "內容..." }
    // 如果報錯，請根據你實際 Proxy 的 JSON 結構修改 data.response
    const data = await res.json();
    if(!data.response) throw new Error("POE API 回應格式異常");
    return data.response; 
}

// --- 輔助功能 ---
function addLog(containerId, sender, text, type) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<strong>${sender}</strong>\n${marked.parse(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
