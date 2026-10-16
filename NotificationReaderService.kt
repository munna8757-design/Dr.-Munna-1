package com.munna.assistai

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.speech.tts.TextToSpeech
import java.util.Locale

/** User-enabled notification reader. Content is spoken, never written to app storage/logs. */
class NotificationReaderService : NotificationListenerService() {
    private var tts: TextToSpeech? = null
    @Volatile private var ready = false

    override fun onCreate() {
        super.onCreate()
        tts = TextToSpeech(applicationContext) { status ->
            ready = status == TextToSpeech.SUCCESS
            if (ready) tts?.language = Locale("bn", "BD")
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName == packageName) return
        val prefs = getSharedPreferences("munna_assist_settings", MODE_PRIVATE)
        if (!prefs.getBoolean("notification_reader_enabled", false) || !ready) return
        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty().take(160)
        val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
            ?: extras.getCharSequence(Notification.EXTRA_TEXT))?.toString().orEmpty().take(400)
        if (title.isBlank() && text.isBlank()) return
        // Do not speak likely authentication, OTP, banking, or payment messages aloud.
        val sensitiveHints = listOf("otp", "one-time password", "verification code", "security code", "login code", "password reset", "bank", "banking", "transaction", "payment", "লেনদেন", "ব্যাংক", "ওটিপি", "ভেরিফিকেশন কোড")
        if (sensitiveHints.any { (title + " " + text).contains(it, ignoreCase = true) }) return
        val spoken = listOf("নোটিফিকেশন", title, text).filter { it.isNotBlank() }.joinToString("। ")
        tts?.speak(spoken, TextToSpeech.QUEUE_ADD, null, "notification-${sbn.key.hashCode()}")
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        super.onDestroy()
    }
}
