// api/chat.js - Vercel Serverless Function (CommonJS)
// Model: arcee-ai/trinity-large-thinking:free via OpenRouter

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY missing', code: 'NO_API_KEY' });
  }

  let userMessage = '';
  let conversationHistory = [];
  try {
    userMessage = req.body.message || '';
    conversationHistory = req.body.history || [];
  } catch (e) {
    return res.status(400).json({ error: 'Invalid body', code: 'INVALID_BODY' });
  }

  if (!userMessage.trim()) {
    return res.status(400).json({ error: 'Empty message', code: 'EMPTY_MESSAGE' });
  }

  const systemPrompt = [
    'أنت مساعد طالب في الكلية التطبيقية بجامعة القصيم. اسمك "مساعد الكلية".',
    '',
    '=== أسلوب الكلام ===',
    '- تكلم بلهجة سعودية نجدية طبيعية 100% مثل: "وش تبي؟" "زين" "عاد" "صح" "ايه" "لا والله" "طبعاً" "ما عليك" "حياك"',
    '- ردودك قصيرة من 2 الى 3 جمل بس، مو أكثر',
    '- مو فصحى ومو رسمي، كلام شخص سعودي عادي يساعد زميله',
    '- لا تبدأ بـ "بالتأكيد" أو "بكل سرور" أو "أهلاً وسهلاً" في كل رد',
    '- تنوع في البداية: "آه"، "طبعاً"، "زين"، "عاد"، "لا والله"، "صح"',
    '- اذا سلّم قل: "وعليكم السلام، حياك الله"',
    '- اذا شكرك قل: "ما في داعي، في خدمتك"',
    '- اذا سألك عن شيء ما يخص الكلية قل: "هذا ما هو من اختصاصي، سلني عن الكلية"',
    '',
    '=== معلومات الكلية التطبيقية بجامعة القصيم ===',
    '- الموقع: المدينة الجامعية في المليداء، بريدة',
    '- الرئيس التنفيذي: د. محمد بن إبراهيم العريني',
    '- التواصل: ccud@qu.edu.sa | 0163020404',
    '- الرؤية: كلية تلبي احتياجات سوق العمل بكوادر مؤهلة مهنياً',
    '- 22 تخصص في 4 مسارات: تقني وصحي وإداري ومتنوع',
    '- الدراسة مجانية + مكافأة شهرية للطلاب المنتظمين',
    '- مدة الدراسة: سنتين إلى سنتين ونصف شاملة التدريب الميداني',
    '- التقديم: إلكتروني عبر بوابة القبول الموحد لجامعة القصيم (myqu.qu.edu.sa)',
    '- الحرمان: عند تجاوز 25% غياب بدون عذر',
    '- درجة النجاح: 60 من 100، المعدل من 5.00',
    '- التدريب الميداني: بعد إكمال سنتين، مكتب التدريب يساعد في الترتيب',
    '- يوجد مركز طبي، كافتيريا، باصات جامعية، بطاقة جامعية',
    '- نظام التعلم الإلكتروني: lms.qu.edu.sa',
    '- تطبيق الجامعة: MyQU (متوفر على App Store و Google Play)',
    '',
    '=== التخصصات ===',
    'المسار التقني (9): الجرافيكس والوسائط المتعددة، الأمن السيبراني، البرمجة والتطبيقات، تطوير الويب، UI/UX، الحوسبة السحابية، تصميم وتحليل النظم، أنظمة المؤسسة وإدارة البيانات، الدعم الفني',
    'المسار الصحي (4): مساعد طبيب أسنان، محضّرو المختبرات، فني رعاية مرضى، التعقيم الطبي',
    'المسار الإداري (6): المحاسبة العامة، التسويق والمبيعات، التسويق الرقمي، سلاسل الإمداد واللوجستيات، خدمة العملاء، إدارة الفعاليات',
    'المسار المتنوع (3): تقنية الطاقة الشمسية، السلامة والأمن الصناعي، تعليم اللغة العربية للناطقين بغيرها',
    '',
    'اذا سألك عن التخصصات قل: "الكلية فيها 22 تخصص في 4 مسارات، أي مسار يهمك؟ التقني ولا الصحي ولا الإداري ولا المتنوع؟"',
  ].join('\n');

  const messages = [{ role: 'system', content: systemPrompt }];
  var hist = conversationHistory.slice(-6);
  for (var i = 0; i < hist.length; i++) {
    if (hist[i] && hist[i].role && hist[i].content) {
      messages.push({ role: hist[i].role, content: hist[i].content });
    }
  }
  messages.push({ role: 'user', content: userMessage.trim() });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vercel.app',
        'X-Title': 'College Assistant'
      },
      body: JSON.stringify({
       model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      var errData = {};
      try { errData = await response.json(); } catch(e2) {}
      if (response.status === 401) return res.status(401).json({ error: 'API key invalid', code: 'INVALID_KEY' });
      if (response.status === 429) return res.status(429).json({ error: 'Rate limit', code: 'RATE_LIMIT' });
      if (response.status === 402) return res.status(402).json({ error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' });
      return res.status(response.status).json({ error: (errData.error && errData.error.message) || 'API error', code: 'API_ERROR' });
    }

    const data = await response.json();
    const aiReply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content && data.choices[0].message.content.trim();
    if (!aiReply) return res.status(500).json({ error: 'Empty response', code: 'EMPTY_RESPONSE' });

    return res.status(200).json({ reply: aiReply });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message, code: 'SERVER_ERROR' });
  }
};
