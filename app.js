// --- 核心智囊團邏輯：POE & 千問版 ---
async function runCouncil() {
    const inputField = document.getElementById('user-input');
    const question = inputField.value.trim();
    if (!question) return;

    // 1. UI 準備
    addLog('execution-log', 'Diego', question, 'user');
    inputField.value = '';
    document.getElementById('thinking-panel').classList.add('active');
    document.getElementById('thinking-log').innerHTML = '';

    // 2. 構思 System Prompt (注入 Diego 2.0 Facts)
    // 包括你粒 14400F, 5060 同埋 6200MHz RAM 嘅數據
    const baseContext = `${diegoContext} 請參與雙 AI 討論，互相質疑並改進想法。`;

    try {
        // 第一步：呼叫千問 (Qwen) 提供硬核技術/理科分析
        addLog('thinking-log', 'System', '等待 通義千問 (Qwen) 分析...', 'system');
        const qwenResponse = await fetchQwen(baseContext, question);
        addLog('thinking-log', '千問 (技術/理科)', qwenResponse, 'gpt'); // 沿用 gpt 樣式顏色

        // 第二步：呼叫 POE (例如內置的 Claude/GPT-4o) 進行檢視
        addLog('thinking-log', 'System', 'POE 正在檢視並互相改進...', 'system');
        const poeResponse = await fetchPoe(baseContext, `用戶問題：${question}\n\n前一位 AI 的建議：\n${qwenResponse}\n\n請以進化觀點進行質疑與補充：`);
        addLog('thinking-log', 'POE (策略/平衡)', poeResponse, 'gemini'); // 沿用 gemini 樣式顏色

        // 第三步：總結輸出到左側
        const finalSynthesis = `### 🎯 AI Council 最終整合\n\n**🛠️ 技術/理科方案 (Qwen)：**\n${extractKeyPoints(qwenResponse)}\n\n**🧠 策略/優化建議 (POE)：**\n${extractKeyPoints(poeResponse)}`;
        
        setTimeout(() => {
            addLog('execution-log', 'Council Output', finalSynthesis, 'system');
        }, 800);

    } catch (error) {
        addLog('execution-log', 'System', `連線失敗: ${error.message}`, 'system');
    }
}

// --- 阿里雲千問 API (DashScope) ---
async function fetchQwen(context, prompt) {
    const key = localStorage.getItem('qwen_api_key'); // 記得去設定度改名
    if (!key) throw new Error("缺少 Qwen API Key");

    const res = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "qwen-max", // 或者用 qwen-plus 慳 Token
            input: {
                messages: [
                    { role: "system", content: context },
                    { role: "user", content: prompt }
                ]
            },
            parameters: { result_format: "message" }
        })
    });
    const data = await res.json();
    return data.output.choices[0].message.content;
}

// --- POE API (假設你使用第三方封裝或自建代理) ---
async function fetchPoe(context, prompt) {
    const key = localStorage.getItem('poe_api_key');
    if (!key) throw new Error("缺少 POE API Key");

    // 注意：POE 官方 API 較為特殊，通常需要透過代理或特定 Library
    // 呢度以標準 REST 格式示意，你需要根據你之前「助手」嘅實際 Endpoint 修改
    const res = await fetch("YOUR_POE_PROXY_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
            bot: "Claude-3-Sonnet", // 你可以揀你想叫邊個 Bot 出戰
            query: `${context}\n\n${prompt}`
        })
    });
    const data = await res.json();
    return data.response; 
}
