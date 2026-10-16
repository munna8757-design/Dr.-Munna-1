package com.munna.assistai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import android.webkit.WebView
import android.webkit.WebSettings
import android.graphics.BitmapFactory
import android.util.Base64
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

private val Ink = Color(0xFF0B1020)
private val Panel = Color(0xFF151D33)
private val Cyan = Color(0xFF61E7F5)
private val Violet = Color(0xFFB59BFF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MunnaApp() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MunnaApp() {
    val appContext = LocalContext.current
    var page by remember { mutableStateOf("Home") }
    var backendUrl by remember { mutableStateOf(BackendSettings.getUrl(appContext)) }
    var backendToken by remember { mutableStateOf(BackendSettings.getToken(appContext)) }
    var showSettings by remember { mutableStateOf(false) }
    MaterialTheme(colorScheme = darkColorScheme(primary = Cyan, secondary = Violet, background = Ink, surface = Panel)) {
        Scaffold(containerColor = Ink, topBar = {
            TopAppBar(title = { Text("Dr. Munna Assist AI", color = Color.White, fontWeight = FontWeight.Bold) },
                actions = { IconButton(onClick = { showSettings = true }) { Icon(Icons.Default.Settings, "Settings", tint = Cyan) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Panel))
        }, bottomBar = {
            NavigationBar(containerColor = Panel) {
                listOf("Home", "AI Chat", "Learn", "Studio", "Tools").forEach { item ->
                    NavigationBarItem(selected = page == item, onClick = { page = item },
                        icon = { Icon(when (item) { "Home" -> Icons.Default.Home; "AI Chat" -> Icons.Default.Chat; "Learn" -> Icons.Default.School; "Studio" -> Icons.Default.AutoAwesome; else -> Icons.Default.Build }, contentDescription = item) },
                        label = { Text(item, fontSize = 10.sp) })
                }
            }
        }) { padding ->
            when (page) {
                "Home" -> HomeScreen(Modifier.padding(padding)) { page = it }
                "AI Chat" -> ChatScreen(Modifier.padding(padding), backendUrl, backendToken)
                "Learn" -> LearnScreen(Modifier.padding(padding))
                "Studio" -> StudioScreen(Modifier.padding(padding), backendUrl, backendToken)
                else -> ToolsScreen(Modifier.padding(padding))
            }
        }
        if (showSettings) BackendSettingsDialog(backendUrl, backendToken, onDismiss = { showSettings = false }, onSave = { url, token ->
            backendUrl = url
            backendToken = token
            BackendSettings.setCredentials(appContext, url, token)
        })
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BackendSettingsDialog(current: String, currentToken: String, onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var url by remember(current) { mutableStateOf(current) }
    var token by remember(currentToken) { mutableStateOf(currentToken) }
    var error by remember { mutableStateOf("") }
    AlertDialog(onDismissRequest = onDismiss, title = { Text("AI Backend সেটিংস") },
        text = { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("HTTPS backend URL এবং server-এর APP_API_TOKEN দিন। GOOGLE_API_KEY শুধু server-এ থাকবে। আপনার prompt AI provider-এ পাঠানো হবে। খালি URL দিলে সীমিত offline demo চলবে।", fontSize = 13.sp)
            OutlinedTextField(value = url, onValueChange = { url = it; error = "" }, label = { Text("Backend HTTPS URL") }, singleLine = true, isError = error.isNotBlank())
            OutlinedTextField(value = token, onValueChange = { token = it }, label = { Text("Backend access token") }, singleLine = true)
            if (error.isNotBlank()) Text(error, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
        } }, confirmButton = { TextButton(onClick = {
            val trimmed = url.trim().trimEnd('/')
            val valid = trimmed.isBlank() || runCatching { val uri = java.net.URI(trimmed); uri.scheme == "https" && !uri.host.isNullOrBlank() }.getOrDefault(false)
            if (valid) { onSave(trimmed, token.trim()); onDismiss() } else error = "HTTPS URL দিন, যেমন https://your-server.example.com"
        }) { Text("Save") } }, dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } })
}

private object BackendSettings {
    private const val PREFS = "munna_assist_settings"
    private const val KEY_URL = "backend_url"
    private const val KEY_TOKEN = "backend_access_token"
    fun getUrl(context: android.content.Context): String = context.getSharedPreferences(PREFS, 0).getString(KEY_URL, "") ?: ""
    fun getToken(context: android.content.Context): String = context.getSharedPreferences(PREFS, 0).getString(KEY_TOKEN, "") ?: ""
    fun setCredentials(context: android.content.Context, url: String, token: String) {
        context.getSharedPreferences(PREFS, 0).edit().putString(KEY_URL, url).putString(KEY_TOKEN, token).apply()
    }
}

@Composable
fun HomeScreen(modifier: Modifier = Modifier, open: (String) -> Unit) {
    LazyColumn(modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF111B35), Ink))).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Text("DR. MUNNA", color = Cyan, fontWeight = FontWeight.Bold); Text("Assist AI", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold); Text("বাংলা ও English · online + basic offline tools", color = Color.LightGray) }
        item { AvatarPanel() }
        item { Text("আপনি কী করতে চান?", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold) }
        item { Feature("AI Chat & Voice", "চ্যাট, speech-to-text ও text-to-speech; live AI-এর জন্য backend URL দিন", Icons.Default.Mic) { open("AI Chat") } }
        item { Feature("Human Body & Health Education", "অ্যানাটমি, ঋতুচক্র, প্রজননস্বাস্থ্য, সম্মতি ও STI প্রতিরোধ", Icons.Default.School) { open("Learn") } }
        item { Feature("AI Creation Studio", "লেখা তৈরি, AI request, কপি ও শেয়ার", Icons.Default.AutoAwesome) { open("Studio") } }
        item { Feature("Tools & Builder", "কোড টেমপ্লেট, dialer/SMS draft ও share", Icons.Default.Build) { open("Tools") } }
        item { Text("ছবি/ভিডিও generation-এর জন্য backend provider access প্রয়োজন; 3D avatar এই সংস্করণে online procedural demo, photorealistic model নয়। পূর্ণ offline LLM এখনও নেই।", color = Color(0xFFFFD58A), fontSize = 12.sp) }
    }
}

@Composable
private fun AvatarPanel() {
    Column(
        Modifier.fillMaxWidth().background(Brush.linearGradient(listOf(Color(0xFF29265D), Color(0xFF123B55))), RoundedCornerShape(24.dp)).padding(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("3D Virtual Assistant", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        Text("অনলাইনে Three.js 3D preview · পোশাক নির্বাচন করুন", color = Color.LightGray, fontSize = 11.sp)
        AndroidView(
            modifier = Modifier.fillMaxWidth().height(360.dp),
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = false
                    settings.allowFileAccess = true
                    settings.allowContentAccess = false
                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                    setBackgroundColor(android.graphics.Color.TRANSPARENT)
                    loadUrl("file:///android_asset/avatar/index.html")
                }
            }
        )
        Text("নোট: এটি procedural 3D demo; photorealistic human scan বা lip-sync নয়। প্রথমবার 3D library load করতে internet লাগবে।", color = Color(0xFFFFD58A), fontSize = 10.sp)
    }
}

@Composable
fun Feature(title: String, description: String, icon: androidx.compose.ui.graphics.vector.ImageVector, click: () -> Unit) {
    Card(onClick = click, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(18.dp)) {
        Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = Cyan, modifier = Modifier.size(28.dp)); Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) { Text(title, color = Color.White, fontWeight = FontWeight.Bold); Text(description, color = Color.LightGray, fontSize = 12.sp) }
            Icon(Icons.Default.ChevronRight, null, tint = Violet)
        }
    }
}

@Composable
fun ChatScreen(modifier: Modifier = Modifier, backendUrl: String, backendToken: String) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var input by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var speakReply by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf("Munna AI: স্বাগতম! মাইক্রোফোন চাপলে voice input, speaker চাপলে উত্তর পড়ে শোনাবে। Live AI চালাতে Settings-এ secure backend URL দিন।") }
    val tts = remember { mutableStateOf<TextToSpeech?>(null) }
    DisposableEffect(context) {
        val engine = TextToSpeech(context) { status -> if (status == TextToSpeech.SUCCESS) tts.value?.language = Locale("bn", "BD") }
        tts.value = engine
        onDispose { engine.stop(); engine.shutdown(); tts.value = null }
    }
    val speechPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startSpeech(context, onText = { input = it }, reportError = { messages.add("Voice: $it") })
        else messages.add("Voice input-এর জন্য microphone permission প্রয়োজন।")
    }
    Column(modifier.fillMaxSize().padding(14.dp)) {
        Text("AI Chat", color = Cyan, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(if (backendUrl.isBlank()) "Offline demo · backend not configured" else "Backend configured · network required", color = Color.LightGray, fontSize = 12.sp)
        LazyColumn(Modifier.weight(1f).padding(vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { items(messages) { msg -> Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Text(msg, color = Color.White, modifier = Modifier.fillMaxWidth().padding(12.dp)) } } }
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f), placeholder = { Text("প্রশ্ন লিখুন…") }, enabled = !busy)
            IconButton(onClick = { if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startSpeech(context, { input = it }, { messages.add("Voice: $it") }) else speechPermission.launch(Manifest.permission.RECORD_AUDIO) }) { Icon(Icons.Default.Mic, "Voice input", tint = Cyan) }
            IconButton(enabled = !busy, onClick = {
                val prompt = input.trim()
                if (prompt.isNotBlank()) {
                    messages.add("আপনি: $prompt"); input = ""; busy = true
                    scope.launch {
                        val answer = withContext(Dispatchers.IO) { if (backendUrl.isBlank()) AssistantLogic.localReply(prompt) else AiBackendClient.ask(backendUrl, backendToken, prompt) }
                        messages.add("Munna AI: $answer"); speakReply = answer; busy = false
                    }
                }
            }) { Icon(Icons.Default.Send, "Send", tint = Cyan) }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (busy) CircularProgressIndicator(Modifier.size(18.dp), color = Cyan, strokeWidth = 2.dp)
            Text(if (busy) "AI উত্তর তৈরি হচ্ছে…" else "", color = Color.LightGray, fontSize = 12.sp, modifier = Modifier.weight(1f))
            TextButton(onClick = { if (speakReply.isNotBlank()) tts.value?.speak(speakReply, TextToSpeech.QUEUE_FLUSH, null, "munna-reply") }) { Icon(Icons.Default.VolumeUp, null); Text("উত্তর শুনুন") }
        }
    }
}

private fun startSpeech(context: android.content.Context, onText: (String) -> Unit, reportError: (String) -> Unit) {
    if (!SpeechRecognizer.isRecognitionAvailable(context)) { reportError("এই ডিভাইসে speech recognition পাওয়া যায়নি।"); return }
    val recognizer = SpeechRecognizer.createSpeechRecognizer(context)
    recognizer.setRecognitionListener(object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {}
        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {}
        override fun onError(error: Int) { reportError("speech recognition error ($error)"); recognizer.destroy() }
        override fun onResults(results: Bundle?) { val result = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull(); if (result != null) onText(result); recognizer.destroy() }
        override fun onPartialResults(partialResults: Bundle?) {}
        override fun onEvent(eventType: Int, params: Bundle?) {}
    })
    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply { putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM); putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD"); putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "bn-BD"); putExtra(RecognizerIntent.EXTRA_PROMPT, "বলুন…") }
    try { recognizer.startListening(intent) } catch (e: Exception) { recognizer.destroy(); reportError(e.message ?: "voice input failed") }
}

@Composable
fun LearnScreen(modifier: Modifier = Modifier) {
    val topics = listOf(
        "মানবদেহের অ্যানাটমি" to "মস্তিষ্ক, হৃদ্‌যন্ত্র, ফুসফুস, হাড়, পেশি ও প্রধান অঙ্গতন্ত্রের পরিচিতি।",
        "প্রজনন অঙ্গ ও প্রক্রিয়া" to "প্রাপ্তবয়স্ক মানবদেহের বৈজ্ঞানিক গঠন, ডিম্বস্ফোটন, ঋতুচক্র, নিষেক ও গর্ভধারণ।",
        "ঋতুচক্র ও মাসিক" to "চক্রের দৈর্ঘ্য ব্যক্তিভেদে ভিন্ন হতে পারে। অতিরিক্ত রক্তপাত, অজ্ঞান হওয়া বা তীব্র ব্যথায় চিকিৎসা নিন।",
        "সম্মতি ও নিরাপদ সম্পর্ক" to "সম্মতি স্বেচ্ছায়, স্পষ্টভাবে এবং যেকোনো সময় প্রত্যাহারযোগ্য। চাপ, ভয় বা অক্ষমতার মধ্যে সম্মতি নয়।",
        "গর্ভনিরোধ ও STI" to "কনডম অনেক STI ঝুঁকি কমায়; অন্য গর্ভনিরোধক STI প্রতিরোধ করে না। সঠিক পরীক্ষা ও পরামর্শের জন্য স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।",
        "পরিচ্ছন্নতা ও কখন চিকিৎসক দেখাবেন" to "নতুন গুটি/ঘা, অস্বাভাবিক স্রাব, জ্বর, তীব্র ব্যথা বা সংক্রমণের আশঙ্কায় যোগ্য স্বাস্থ্যসেবা নিন।",
        "3D শিক্ষামূলক মডেল" to "এই সংস্করণে 3D model যুক্ত হয়নি; পরবর্তী ধাপে যাচাইকৃত, লাইসেন্সযুক্ত অ্যানাটমি asset লাগবে।"
    )
    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text("Education Center", color = Cyan, fontSize = 26.sp, fontWeight = FontWeight.Bold); Text("সাধারণ শিক্ষা; ব্যক্তিগত রোগনির্ণয় নয়", color = Color.LightGray) }
        items(topics) { (title, body) -> Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp)) { Column(Modifier.padding(15.dp)) { Text(title, color = Violet, fontWeight = FontWeight.Bold, fontSize = 17.sp); Spacer(Modifier.height(6.dp)); Text(body, color = Color.White) } } }
    }
}

@Composable
fun StudioScreen(modifier: Modifier = Modifier, backendUrl: String, backendToken: String) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var kind by remember { mutableStateOf("লেখা") }
    var prompt by remember { mutableStateOf("") }
    var result by remember { mutableStateOf("") }
    var imageBase64 by remember { mutableStateOf("") }
    var videoOperation by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var videoStatus by remember { mutableStateOf("") }
    val generatedBitmap by produceState<ImageBitmap?>(initialValue = null, key1 = imageBase64) {
        value = if (imageBase64.isBlank()) null else withContext(Dispatchers.Default) {
            runCatching {
                val bytes = Base64.decode(imageBase64, Base64.DEFAULT)
                BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
            }.getOrNull()
        }
    }
    Column(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("AI Creation Studio", color = Cyan, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("লেখা offline demo বা online AI দিয়ে; ছবি/ভিডিওর জন্য backend, সমর্থিত model এবং provider quota/billing লাগতে পারে।", color = Color.LightGray, fontSize = 12.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("লেখা", "ছবি", "ভিডিও").forEach { FilterChip(selected = kind == it, onClick = { kind = it }, label = { Text(it) }) }
        }
        OutlinedTextField(value = prompt, onValueChange = { prompt = it }, label = { Text("কী তৈরি করতে চান?") }, modifier = Modifier.fillMaxWidth(), minLines = 2)
        Button(enabled = !busy && prompt.isNotBlank(), onClick = {
            val p = prompt.trim()
            busy = true; result = ""; imageBase64 = ""; videoOperation = ""; videoStatus = ""
            scope.launch {
                try {
                    when (kind) {
                        "ছবি" -> {
                            if (backendUrl.isBlank()) result = "ছবি তৈরি করতে Settings-এ deployed backend URL দিন।"
                            else {
                                val data = withContext(Dispatchers.IO) { AiBackendClient.generateImage(backendUrl, backendToken, p) }
                                imageBase64 = data.optString("imageBase64", "")
                                result = data.optString("reply", if (imageBase64.isNotBlank()) "ছবি তৈরি হয়েছে।" else "ছবি ফেরত আসেনি।")
                            }
                        }
                        "ভিডিও" -> {
                            if (backendUrl.isBlank()) result = "ভিডিও তৈরি করতে Settings-এ deployed backend URL দিন। Veo access ও billing লাগতে পারে।"
                            else {
                                val data = withContext(Dispatchers.IO) { AiBackendClient.startVideo(backendUrl, backendToken, p) }
                                videoOperation = data.optString("operation", "")
                                videoStatus = data.optString("status", "")
                                result = data.optString("reply", "ভিডিও generation request পাঠানো হয়েছে।")
                            }
                        }
                        else -> {
                            val request = "বাংলায় লেখা তৈরি করুন। ধরন: creative writing. বিষয়: $p. পরিষ্কারভাবে লিখুন।"
                            result = withContext(Dispatchers.IO) { if (backendUrl.isBlank()) AssistantLogic.makeCreation("লেখা", p) else AiBackendClient.ask(backendUrl, backendToken, request) }
                        }
                    }
                } catch (e: Exception) { result = "এই কাজটি সম্পন্ন হয়নি: ${e.message ?: e.javaClass.simpleName}" }
                finally { busy = false }
            }
        }, modifier = Modifier.fillMaxWidth()) {
            if (busy) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp) else Icon(Icons.Default.AutoAwesome, null)
            Spacer(Modifier.width(8.dp)); Text(when (kind) { "ছবি" -> "ছবি তৈরি করুন"; "ভিডিও" -> "ভিডিও তৈরি শুরু করুন"; else -> "লেখা তৈরি করুন" })
        }
        if (result.isNotBlank()) Card(colors = CardDefaults.cardColors(containerColor = Panel)) { SelectionContainer { Text(result, color = Color.White, modifier = Modifier.fillMaxWidth().padding(14.dp)) } }
        if (imageBase64.isNotBlank()) {
            if (generatedBitmap != null) Image(bitmap = generatedBitmap!!, contentDescription = "AI generated image", modifier = Modifier.fillMaxWidth().heightIn(max = 360.dp))
            else Text("ছবির ডেটা decode হচ্ছে বা এই ডিভাইসে decode করা যায়নি।", color = Color.LightGray)
        }
        if (videoOperation.isNotBlank()) {
            Text("Video operation: $videoOperation", color = Color.LightGray, fontSize = 11.sp)
            OutlinedButton(onClick = {
                busy = true
                scope.launch {
                    try {
                        val status = withContext(Dispatchers.IO) { AiBackendClient.videoStatus(backendUrl, backendToken, videoOperation) }
                        videoStatus = status.optString("status", "unknown")
                        result = status.optString("reply", result)
                        if (status.optBoolean("done", false)) {
                            val file = withContext(Dispatchers.IO) {
                                val bytes = AiBackendClient.downloadVideo(backendUrl, backendToken, videoOperation)
                                val folder = java.io.File(context.cacheDir, "generated_media").apply { mkdirs() }
                                java.io.File(folder, "dr-munna-${System.currentTimeMillis()}.mp4").apply { writeBytes(bytes) }
                            }
                            val contentUri = FileProvider.getUriForFile(context, "com.munna.assistai.fileprovider", file)
                            val view = Intent(Intent.ACTION_VIEW).setDataAndType(contentUri, "video/mp4").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            context.startActivity(Intent.createChooser(view, "ভিডিও দেখুন / শেয়ার করুন"))
                            result = "ভিডিও তৈরি ও ডাউনলোড হয়েছে। ফাইলটি অ্যাপের cache-এ রাখা হয়েছে; Share/Save করে স্থায়ীভাবে রাখুন।"
                        }
                    } catch (e: Exception) { result = "Status check ব্যর্থ: ${e.javaClass.simpleName}" }
                    finally { busy = false }
                }
            }, enabled = !busy) { Text("ভিডিওর অবস্থা দেখুন ($videoStatus)") }
        }
        if (result.isNotBlank() && kind == "লেখা") {
            Row { TextButton(onClick = { val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, result); context.startActivity(Intent.createChooser(send, "Share creation")) }) { Icon(Icons.Default.Share, null); Text("Share") }; TextButton(onClick = { val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager; clipboard.setPrimaryClip(android.content.ClipData.newPlainText("Munna AI", result)) }) { Icon(Icons.Default.ContentCopy, null); Text("Copy") } }
        }
    }
}

@Composable
fun ToolsScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("munna_assist_settings", 0) }
    var phone by remember { mutableStateOf("") }
    var sms by remember { mutableStateOf("") }
    var codeKind by remember { mutableStateOf("Kotlin") }
    var readNotifications by remember { mutableStateOf(prefs.getBoolean("notification_reader_enabled", false)) }
    val code = if (codeKind == "Kotlin") "fun main() {\n    println(\"Hello from Dr. Munna Assist AI\")\n}" else "print('Hello from Dr. Munna Assist AI')"
    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Tools & Mobile Control", color = Cyan, fontSize = 26.sp, fontWeight = FontWeight.Bold); Text("ফোনের কাজগুলো আপনার সম্মতিতে এবং Android-এর নিজস্ব screen/permission দিয়ে হবে।", color = Color.LightGray, fontSize = 12.sp) }
        item { Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Quick app launcher", color = Violet, fontWeight = FontWeight.Bold)
            Text("অ্যাপ খুলুন বা ফোনের সেটিংসে যান। এটি গোপনে tap/পড়ার পূর্ণ নিয়ন্ত্রণ নয়।", color = Color.White, fontSize = 12.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { openAppOrWeb(context, "com.google.android.youtube", "https://www.youtube.com") }) { Text("YouTube") }
                Button(onClick = { openAppOrWeb(context, "com.facebook.katana", "https://www.facebook.com") }) { Text("Facebook") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { runCatching { context.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS)) } }) { Text("Wi-Fi settings") }
                OutlinedButton(onClick = { runCatching { context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS)) } }) { Text("Bluetooth") }
            }
        } } }
        item { Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Notification reader (opt-in)", color = Violet, fontWeight = FontWeight.Bold)
            Text("চালু করলে Android Notification Access দিয়ে আসা notification-এর title/text TTS-এ পড়ে শোনাবে। সংবেদনশীল বার্তাও থাকতে পারে; default বন্ধ। কোনো notification অ্যাপে সংরক্ষণ করা হয় না।", color = Color.White, fontSize = 12.sp)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = readNotifications, onCheckedChange = { readNotifications = it; prefs.edit().putBoolean("notification_reader_enabled", it).apply() })
                Text("Notification পড়ে শোনানো চালু", color = Color.White)
            }
            Button(onClick = { runCatching { context.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) } }, modifier = Modifier.fillMaxWidth()) { Text("Android Notification Access খুলুন") }
        } } }
        item { Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Phone / SMS", color = Violet, fontWeight = FontWeight.Bold)
            OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("ফোন নম্বর") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(value = sms, onValueChange = { sms = it }, label = { Text("SMS message (optional)") }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { runCatching { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(phone)}"))) } }, enabled = phone.isNotBlank()) { Icon(Icons.Default.Call, null); Text("Dial") }
                OutlinedButton(onClick = { runCatching { context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${Uri.encode(phone)}")).putExtra("sms_body", sms)) } }, enabled = phone.isNotBlank()) { Icon(Icons.Default.Sms, null); Text("SMS draft") }
            }
        } } }
        item { Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Code Builder · basic template", color = Violet, fontWeight = FontWeight.Bold)
            Row { FilterChip(selected = codeKind == "Kotlin", onClick = { codeKind = "Kotlin" }, label = { Text("Kotlin") }); Spacer(Modifier.width(8.dp)); FilterChip(selected = codeKind == "Python", onClick = { codeKind = "Python" }, label = { Text("Python") }) }
            SelectionContainer { Text(code, color = Color.White, fontSize = 13.sp) }
            Text("এটি code template দেখায়; নিজে compile/test বা APK/EXE export করে না।", color = Color.LightGray, fontSize = 12.sp)
            OutlinedButton(onClick = { val intent = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, code); context.startActivity(Intent.createChooser(intent, "Share code")) }) { Icon(Icons.Default.Share, null); Text("Share code") }
        } } }
    }
}

private fun openAppOrWeb(context: android.content.Context, packageName: String, fallbackUrl: String) {
    try {
        val launch = context.packageManager.getLaunchIntentForPackage(packageName)
        if (launch != null) context.startActivity(launch)
        else context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)))
    } catch (_: Exception) {
        runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl))) }
    }
}

private object AiBackendClient {
    private fun request(baseUrl: String, token: String, path: String, payload: org.json.JSONObject): org.json.JSONObject {
        val url = java.net.URL(baseUrl.trimEnd('/') + path)
        val conn = (url.openConnection() as java.net.HttpURLConnection).apply {
            requestMethod = "POST"; connectTimeout = 15000; readTimeout = 90000; doOutput = true
            setRequestProperty("Content-Type", "application/json; charset=utf-8")
            setRequestProperty("Authorization", "Bearer $token")
        }
        try {
            conn.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            val status = conn.responseCode
            val stream = if (status in 200..299) conn.inputStream else conn.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            val json = runCatching { org.json.JSONObject(text) }.getOrElse { org.json.JSONObject().put("reply", "Server response পড়া যায়নি ($status).") }
            if (status !in 200..299 && !json.has("reply")) json.put("reply", "AI server error ($status)")
            return json
        } finally { conn.disconnect() }
    }
    fun ask(baseUrl: String, token: String, prompt: String): String = try {
        request(baseUrl, token, "/chat", org.json.JSONObject().put("message", prompt)).optString("reply", "Server থেকে উত্তর পাওয়া যায়নি।")
    } catch (e: Exception) { "AI server-এ সংযোগ হয়নি। URL, internet ও server log পরীক্ষা করুন। (${e.javaClass.simpleName})" }
    fun generateImage(baseUrl: String, token: String, prompt: String): org.json.JSONObject = request(baseUrl, token, "/image", org.json.JSONObject().put("prompt", prompt))
    fun startVideo(baseUrl: String, token: String, prompt: String): org.json.JSONObject = request(baseUrl, token, "/video", org.json.JSONObject().put("prompt", prompt))
    fun videoStatus(baseUrl: String, token: String, operation: String): org.json.JSONObject {
        val url = java.net.URL(baseUrl.trimEnd('/') + "/video/status?operation=" + java.net.URLEncoder.encode(operation, "UTF-8"))
        val conn = (url.openConnection() as java.net.HttpURLConnection).apply { requestMethod = "GET"; connectTimeout = 15000; readTimeout = 45000; setRequestProperty("Authorization", "Bearer $token") }
        try {
            val status = conn.responseCode
            val stream = if (status in 200..299) conn.inputStream else conn.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            return runCatching { org.json.JSONObject(text) }.getOrElse { org.json.JSONObject().put("reply", "Video status response পড়া যায়নি ($status).") }
        } finally { conn.disconnect() }
    }
    fun downloadVideo(baseUrl: String, token: String, operation: String): ByteArray {
        val url = java.net.URL(baseUrl.trimEnd('/') + "/video/download?operation=" + java.net.URLEncoder.encode(operation, "UTF-8"))
        val conn = (url.openConnection() as java.net.HttpURLConnection).apply { requestMethod = "GET"; connectTimeout = 15000; readTimeout = 120000; setRequestProperty("Authorization", "Bearer $token") }
        try {
            val status = conn.responseCode
            if (status !in 200..299) {
                val message = conn.errorStream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
                throw IllegalStateException("Video download error ($status): ${message.take(180)}")
            }
            return conn.inputStream.use { input -> input.readBytes() }
        } finally { conn.disconnect() }
    }
}
