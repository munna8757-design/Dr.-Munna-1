"""Dr. Munna Assist AI backend. Keep GOOGLE_API_KEY server-side only.
Endpoints: GET /health; POST /chat; POST /image; POST /video; GET /video/status?operation=...
Image and video provider access/quotas/billing depend on the Google AI account and model availability.
"""
import base64
import hmac
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8080"))
CHAT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")
VIDEO_MODEL = os.getenv("GEMINI_VIDEO_MODEL", "veo-3.1-generate-preview")
API_KEY = os.getenv("GOOGLE_API_KEY", "")
APP_API_TOKEN = os.getenv("APP_API_TOKEN", "")
MAX_BODY = 20000


def api_request(url, payload=None, timeout=60, method=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
        method=method or ("POST" if data is not None else "GET"),
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def api_request_bytes(url, timeout=120):
    req = urllib.request.Request(url, headers={"x-goog-api-key": API_KEY}, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as response:
        content_type = response.headers.get("Content-Type", "video/mp4")
        body = response.read(80 * 1024 * 1024 + 1)
    if len(body) > 80 * 1024 * 1024:
        raise OverflowError("video_too_large")
    return content_type, body


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _authorized(self):
        if not APP_API_TOKEN:
            self._send(503, {"error": "auth_not_configured", "reply": "Server administrator must set APP_API_TOKEN before enabling paid AI endpoints."})
            return False
        supplied = self.headers.get("Authorization", "")
        expected = "Bearer " + APP_API_TOKEN
        if not hmac.compare_digest(supplied, expected):
            self._send(401, {"error": "unauthorized", "reply": "Backend token missing or invalid."})
            return False
        return True

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise ValueError("invalid_content_length")
        if length <= 0 or length > MAX_BODY:
            raise OverflowError("invalid_request_size")
        data = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("json_object_required")
        return data

    def _provider_error(self, exc):
        if isinstance(exc, urllib.error.HTTPError):
            detail = exc.read().decode("utf-8", errors="replace")[:700]
            self._send(502, {"error": "provider_error", "reply": f"AI provider returned HTTP {exc.code}: {detail}"})
        elif isinstance(exc, (ValueError, json.JSONDecodeError, UnicodeDecodeError)):
            self._send(400, {"error": "invalid_json", "reply": "Request JSON সঠিক নয়।"})
        elif isinstance(exc, OverflowError):
            self._send(413, {"error": "invalid_request_size", "reply": "Request খুব বড়।"})
        else:
            self._send(500, {"error": "internal_error", "reply": f"Backend error: {type(exc).__name__}"})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/health":
            self._send(200, {"ok": True, "service": "Dr. Munna Assist AI backend", "chat_configured": bool(API_KEY and APP_API_TOKEN), "image_configured": bool(API_KEY and APP_API_TOKEN), "video_configured": bool(API_KEY and APP_API_TOKEN), "auth_configured": bool(APP_API_TOKEN)})
            return
        if parsed.path == "/video/status":
            if not self._authorized():
                return
            if not API_KEY:
                self._send(503, {"error": "server_not_configured", "reply": "Server administrator must set GOOGLE_API_KEY."})
                return
            operation = urllib.parse.parse_qs(parsed.query).get("operation", [""])[0]
            if not operation.startswith("operations/") or ".." in operation or len(operation) > 500:
                self._send(400, {"error": "invalid_operation", "reply": "Video operation name সঠিক নয়।"})
                return
            try:
                result = api_request(f"https://generativelanguage.googleapis.com/v1beta/{operation}", timeout=40, method="GET")
                done = bool(result.get("done"))
                video_uri = ""
                response = result.get("response", {})
                samples = response.get("generateVideoResponse", {}).get("generatedSamples", [])
                if samples:
                    video_uri = samples[0].get("video", {}).get("uri", "")
                self._send(200, {"ok": True, "done": done, "status": "done" if done else "processing", "operation": operation, "videoUri": video_uri, "reply": ("ভিডিও তৈরি হয়েছে। Link খুললে provider-এর video দেখা/ডাউনলোড করা যেতে পারে।" if done and video_uri else ("ভিডিও তৈরি হচ্ছে; কিছুক্ষণ পর আবার status দেখুন।" if not done else "Generation শেষ হয়েছে, কিন্তু video URL পাওয়া যায়নি।"))})
            except Exception as exc:
                self._provider_error(exc)
            return
        if parsed.path == "/video/download":
            if not self._authorized():
                return
            if not API_KEY:
                self._send(503, {"error": "server_not_configured", "reply": "Server administrator must set GOOGLE_API_KEY."})
                return
            operation = urllib.parse.parse_qs(parsed.query).get("operation", [""])[0]
            if not operation.startswith("operations/") or ".." in operation or len(operation) > 500:
                self._send(400, {"error": "invalid_operation", "reply": "Video operation name সঠিক নয়।"})
                return
            try:
                status = api_request(f"https://generativelanguage.googleapis.com/v1beta/{operation}", timeout=40, method="GET")
                if not status.get("done"):
                    self._send(409, {"error": "video_not_ready", "reply": "ভিডিও এখনও তৈরি হয়নি; পরে আবার চেষ্টা করুন।"})
                    return
                samples = status.get("response", {}).get("generateVideoResponse", {}).get("generatedSamples", [])
                uri = samples[0].get("video", {}).get("uri", "") if samples else ""
                if not uri.startswith("https://"):
                    self._send(502, {"error": "video_uri_missing", "reply": "Provider video URL দেয়নি।"})
                    return
                content_type, body = api_request_bytes(uri)
                self.send_response(200)
                self.send_header("Content-Type", content_type if content_type.startswith("video/") else "video/mp4")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Disposition", 'attachment; filename="dr-munna-generated.mp4"')
                self.end_headers()
                self.wfile.write(body)
            except Exception as exc:
                self._provider_error(exc)
            return
        self._send(404, {"error": "not_found"})

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path not in ("/chat", "/image", "/video"):
            self._send(404, {"error": "not_found"})
            return
        if not self._authorized():
            return
        if not API_KEY:
            self._send(503, {"error": "server_not_configured", "reply": "Server administrator must set GOOGLE_API_KEY."})
            return
        try:
            data = self._read_json()
            prompt = str(data.get("message", "") if path == "/chat" else data.get("prompt", "")).strip()
            if not prompt:
                self._send(400, {"error": "prompt_required", "reply": "একটি prompt লিখুন।"})
                return
            if len(prompt) > 12000:
                self._send(413, {"error": "prompt_too_long", "reply": "Prompt সর্বোচ্চ 12000 অক্ষর হতে পারে।"})
                return
            if path == "/chat":
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{CHAT_MODEL}:generateContent"
                payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048}}
                result = api_request(endpoint, payload, timeout=55)
                parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                reply = "\n".join(part.get("text", "") for part in parts if part.get("text")) or "The AI provider returned no text. Try again."
                self._send(200, {"reply": reply})
                return
            if path == "/image":
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{IMAGE_MODEL}:generateContent"
                payload = {"contents": [{"role": "user", "parts": [{"text": "Create a high-quality image based on this prompt: " + prompt}]}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}}
                result = api_request(endpoint, payload, timeout=90)
                text_parts, image_part = [], None
                for part in result.get("candidates", [{}])[0].get("content", {}).get("parts", []):
                    if part.get("text"): text_parts.append(part["text"])
                    inline = part.get("inlineData") or part.get("inline_data")
                    if inline and inline.get("data"):
                        image_part = {"imageBase64": inline["data"], "mimeType": inline.get("mimeType", inline.get("mime_type", "image/png"))}
                response = {"reply": " ".join(text_parts) or ("ছবি তৈরি হয়েছে।" if image_part else "Image model কোনো ছবি ফেরত দেয়নি।")}
                if image_part: response.update(image_part)
                self._send(200, response)
                return
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{VIDEO_MODEL}:predictLongRunning"
            payload = {"instances": [{"prompt": prompt}], "parameters": {"aspectRatio": "16:9", "sampleCount": 1}}
            result = api_request(endpoint, payload, timeout=55)
            operation = result.get("name", "")
            if not operation:
                self._send(502, {"error": "operation_missing", "reply": "Provider video operation name ফেরত দেয়নি; model access পরীক্ষা করুন."})
            else:
                self._send(200, {"ok": True, "operation": operation, "status": "processing", "reply": "ভিডিও generation শুরু হয়েছে। কিছুক্ষণ পর status পরীক্ষা করুন; Veo availability/quota/billing account-ভেদে বদলায়।"})
        except Exception as exc:
            self._provider_error(exc)

    def log_message(self, fmt, *args):
        # Do not log prompt bodies or API keys.
        super().log_message(fmt, *args)

if __name__ == "__main__":
    print(f"Dr. Munna Assist AI backend listening on {HOST}:{PORT}; chat={CHAT_MODEL}; image={IMAGE_MODEL}; video={VIDEO_MODEL}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
