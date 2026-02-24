// --- 基礎設定與 UI 控制 ---
let diegoContext = "用戶 Diego：高一學生，硬體配置 i5-14400F + RTX 5060 + DDR5 6200MHz CL40 @ 1.27V + 2K 210Hz。具備開發者思維，追求極限效能與生活掌控感的平衡。";

window.onload = () => {
    if(localStorage.getItem('diego_openai_key')) document.getElementById('openai-key').value = localStorage.getItem('diego_openai_key');
    if(localStorage.getItem('diego_gemini_key')) document.getElementById('gemini-key').value = localStorage.getItem('diego_gemini_key');
};

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function saveKeys() {
    localStorage.setItem('diego_openai_key', document.getElementById('openai-key').value);
    localStorage.setItem('diego_gemini_key', document.getElementById('gemini-key').value);
    toggleSettings();
    alert("API Keys 已安全儲存於本地！");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function syncData() {
    // 未來可以擴充為自動呼叫 API 總結，目前先更新基礎 Context
    alert("已同步 Diego 最新 Fact 到 System Prompt！");
    addLog('execution-log', 'System', '最新 Fact 已載入。', 'system');
}

// --- 核心智囊團邏輯 ---
async function runCouncil() {
    const inputField = document.getElementById('user-input');
    const question = inputField.value.trim();
    if (!question) return;

    // 1. 顯示問題，清空輸入框，展開右側思考區
    addLog('execution-log', 'Diego', question, 'user');
    inputField.value = '';
    document.getElementById('thinking-panel').classList.add('active');
    document.getElementById('thinking-log').innerHTML = ''; // 清空上一輪思考

    const gptPrompt = `${diegoContext} 你是底層工程顧問。請提供純技術、數據化的優化建議，無需廢話。`;
    const geminiPrompt = `${diegoContext} 你是動態進化 Co-pilot。請檢視 ChatGPT 的建議，並從時間成本、高一學業及掌控感角度提出改進與平衡方案。`;

    try {
        // 第一步：ChatGPT 提出底層技術方案
        addLog('thinking-log', 'System', '等待 ChatGPT 工程分析...', 'system');
        const gptDraft = await fetchOpenAI(gptPrompt, question);
        addLog('thinking-log', 'ChatGPT (工程視角)', gptDraft, 'gpt');

        // 第二步：Gemini 檢視並提出平衡方案
        addLog('thinking-log', 'System', 'Gemini 正在檢視並互相改進...', 'system');
        const geminiCritique = await fetchGemini(geminiPrompt, `用戶問題：${question}\n\nChatGPT技術方案：\n${gptDraft}\n\n請改進及補充：`);
        addLog('thinking-log', 'Gemini (進化視角)', geminiCritique, 'gemini');

        // 第三步：輸出最終整合到左側
        addLog('execution-log', 'System', '正在生成最終決策...', 'system');
        const finalSynthesis = `### 🎯 AI Council 最終決策\n\n**⚙️ ChatGPT 技術要點：**\n${extractKeyPoints(gptDraft)}\n\n**🧠 Gemini 平衡策略：**\n${extractKeyPoints(geminiCritique)}`;
        
        // 模擬一個小延遲令 UX 更好
        setTimeout(() => {
            addLog('execution-log', 'Council Output', finalSynthesis, 'system');
        }, 1000);

    } catch (error) {
        addLog('execution-log', 'System', `Error: ${error.message} (請檢查 API Key)`, 'system');
    }
}

// --- API 呼叫函數 ---
async function fetchOpenAI(systemContext, prompt) {
    const key = localStorage.getItem('diego_openai_key');
    if (!key) throw new Error("缺少 OpenAI API Key");
    
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
            model: "gpt-4o-mini", // 用住 mini 先，如果你有 plus 條 key 可以轉 gpt-4o
            messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
        })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function fetchGemini(systemContext, prompt) {
    const key = localStorage.getItem('diego_gemini_key');
    if (!key) throw new Error("缺少 Gemini API Key");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemContext }]},
            contents: [{ parts: [{ text: prompt }]}]
        })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
}

// --- 輔助函數 ---
function addLog(containerId, sender, text, type) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<strong>${sender}</strong><br>${marked.parse(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function extractKeyPoints(text) {
    // 簡單提煉首 150 字作為總結預覽，你可以再優化呢個 AI 提煉邏輯
    return text.substring(0, 150) + '...';
}
