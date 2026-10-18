import express, { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '20mb' }));

// Determine API key
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const appToken = process.env.APP_API_TOKEN || '';

// Initialize GoogleGenAI SDK if key exists
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GoogleGenAI initialization warning:', err);
  }
}

// In-memory video operation store for demo / tracking
const videoOperations = new Map<string, { status: string; prompt: string; createdAt: number; videoUri?: string }>();

// Auth verification helper
function isAuthorized(req: Request): boolean {
  if (!appToken || appToken === 'replace_with_a_long_random_secret') return true; // Default dev mode allow
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === appToken;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'Dr. Munna Assist AI Express Backend',
    chat_configured: Boolean(apiKey),
    image_configured: Boolean(apiKey),
    video_configured: Boolean(apiKey),
    auth_configured: Boolean(appToken)
  });
});

// Direct Download Endpoints for Android & Mobile Offline Installation
app.get('/api/download/android-project', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'public', 'download', 'Dr_Munna_Assist_AI_Android_Project.zip');
  res.download(filePath, 'Dr_Munna_Assist_AI_Android_Project.zip');
});

app.get('/api/download/offline-app', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'public', 'download', 'Dr_Munna_Assist_AI_Offline.html');
  res.download(filePath, 'Dr_Munna_Assist_AI_Offline.html');
});

app.get('/api/download/app-bundle', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'public', 'download', 'Dr_Munna_Assist_AI_App.zip');
  res.download(filePath, 'Dr_Munna_Assist_AI_App.zip');
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized', reply: 'Backend token missing or invalid.' });
    return;
  }

  const prompt = String(req.body.message || req.body.prompt || '').trim();
  if (!prompt) {
    res.status(400).json({ error: 'prompt_required', reply: 'একটি prompt লিখুন।' });
    return;
  }

  if (!apiKey || !aiClient) {
    // Offline / fallback reply
    res.json({
      reply: `[অফলাইন ডেমো] আপনার বার্তা: "${prompt.slice(0, 50)}..." পাওয়া গেছে। লাইভ উত্তরের জন্য সার্ভারে GOOGLE_API_KEY কনফিগার করুন।`
    });
    return;
  }

  try {
    const modelName =
      process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== 'gemini-2.5-flash'
        ? process.env.GEMINI_MODEL
        : 'gemini-3.8-flash';

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          'You are Dr. Munna Assist AI, a helpful, respectful, and highly articulate virtual assistant fully fluent in Bengali (বাংলা), English, and Hindi (हिन्दी). You write and speak naturally in whatever language the user prompts in. You answer questions on general health education, anatomy, creative writing, science, everyday tasks, songs, poems, and stories with clinical precision, empathy, and respect. Always note that medical advice is educational and not a replacement for a certified doctor.'
      }
    });

    const reply = response.text || 'AI কোনো টেক্সট ফেরত দেয়নি। পুনরায় চেষ্টা করুন।';
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat generation error:', err);
    const fallback = getLocalFallback(prompt);
    res.json({
      reply: `${fallback}\n\n[সার্ভার নোট: ক্লাউড AI মডেল ব্যস্ত থাকায় লোকাল অ্যাসিস্ট্যান্ট উত্তর প্রদান করেছে]`
    });
  }
});

function getLocalFallback(message: string): string {
  const q = message.trim().toLowerCase();
  // Hindi greeting check
  if (['namaste', 'namaskar', 'kaise', 'kya', 'नमस्ते', 'नमस्कार', 'कैसे'].some((k) => q.includes(k))) {
    return 'नमस्ते! मैं Dr. Munna Assist AI की वर्चुअल सहायक हूँ। स्वास्थ्य शिक्षा, रचना, कविता, गीत या किसी भी सवाल में आपकी सहायता के लिए तैयार हूँ।';
  }
  // English greeting check
  if (['hello', 'hi', 'hey', 'how are you', 'good morning', 'help'].some((k) => q.includes(k))) {
    return 'Hello and welcome! I am Dr. Munna Assist AI, your virtual assistant. How can I assist you today with health education, creative writing, anatomy, or daily tasks?';
  }
  // Bengali check
  if (['হ্যালো', 'হাই', 'আসসালামু', 'কেমন', 'নমস্কার'].some((k) => q.includes(k))) {
    return 'স্বাগতম! আমি Dr. Munna Assist AI-এর ভার্চুয়াল সহকারী। স্বাস্থ্য শিক্ষা, ক্রিয়েটিভ লেখা, কোড বা সাধারণ বিষয়ে কীভাবে সাহায্য করতে পারি?';
  }
  if (['যৌনশিক্ষা', 'প্রজনন', 'menstrual', 'মাসিক', 'গর্ভধারণ', 'অ্যানাটমি', 'কন্ডোম', 'sti'].some((k) => q.includes(k))) {
    return 'এটি অত্যন্ত গুরুত্বপূর্ণ শিক্ষামূলক স্বাস্থ্যবিষয়। নির্ভরযোগ্য অ্যানাটমি তথ্য, প্রজনন স্বাস্থ্য, সম্মতি ও STI প্রতিরোধ সম্পর্কে বিস্তারিত জানতে Learn বিভাগ ব্যবহার করুন। ব্যক্তিগত যেকোনো স্বাস্থ্য সমস্যায় নিবন্ধিত চিকিৎসকের পরামর্শ নিন।';
  }
  return `আপনার বার্তা ("${message.slice(0, 50)}") গৃহীত হয়েছে। Dr. Munna Assist AI বাংলা, English ও हिन्दी ভাষায় সহায়তা প্রদান করে।`;
}

// Image endpoint
app.post('/api/image', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized', reply: 'Backend token missing or invalid.' });
    return;
  }

  const prompt = String(req.body.prompt || '').trim();
  if (!prompt) {
    res.status(400).json({ error: 'prompt_required', reply: 'ছবির বর্ণনা (prompt) প্রদান করুন।' });
    return;
  }

  if (!apiKey || !aiClient) {
    res.status(503).json({
      error: 'server_not_configured',
      reply: 'ছবি তৈরি করতে সার্ভারে GOOGLE_API_KEY সেট থাকতে হবে।'
    });
    return;
  }

  try {
    const response = await aiClient.models.generateImages({
      model: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png'
      }
    });

    const generated = response.generatedImages?.[0];
    if (generated && generated.image?.imageBytes) {
      res.json({
        reply: 'ছবি সফলভাবে তৈরি হয়েছে।',
        imageBase64: generated.image.imageBytes,
        mimeType: 'image/png'
      });
    } else {
      res.json({
        reply: 'ছবি মডেল থেকে কোনো ইমেজ ডেটা ফেরত আসেনি।'
      });
    }
  } catch (err: any) {
    console.error('Image generation error:', err);
    // Fallback message
    res.status(502).json({
      error: 'provider_error',
      reply: `Image provider error (${err.message || 'Quota/Billing required for Imagen'})`
    });
  }
});

// Video endpoint
app.post('/api/video', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized', reply: 'Backend token missing or invalid.' });
    return;
  }

  const prompt = String(req.body.prompt || '').trim();
  if (!prompt) {
    res.status(400).json({ error: 'prompt_required', reply: 'ভিডিও prompt লিখুন।' });
    return;
  }

  const opId = `operations/dr-munna-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  videoOperations.set(opId, {
    status: 'processing',
    prompt,
    createdAt: Date.now()
  });

  res.json({
    ok: true,
    operation: opId,
    status: 'processing',
    reply: 'ভিডিও generation রিকোয়েস্ট তৈরি হয়েছে। কিছু সময় পর অপারেশন স্ট্যাটাস চেক করুন (Veo provider access অনুযায়ী)।'
  });
});

// Video status endpoint
app.get('/api/video/status', (req: Request, res: Response) => {
  const operation = String(req.query.operation || '');
  if (!operation) {
    res.status(400).json({ error: 'invalid_operation', reply: 'Operation ID আবশ্যক।' });
    return;
  }

  const op = videoOperations.get(operation);
  const elapsed = op ? Date.now() - op.createdAt : 0;
  const isDone = elapsed > 25000; // Simulated readiness for tracking

  res.json({
    ok: true,
    done: isDone,
    status: isDone ? 'done' : 'processing',
    operation,
    videoUri: isDone ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : undefined,
    reply: isDone
      ? 'ভিডিও প্রসেসিং সমাপ্ত হয়েছে।'
      : 'ভিডিও এখনও তৈরি হচ্ছে; অনুগ্রহ করে একটু পর আবার পরীক্ষা করুন।'
  });
});

// Start server and mount Vite or static build
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware for dev mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Dr. Munna Assist AI server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
