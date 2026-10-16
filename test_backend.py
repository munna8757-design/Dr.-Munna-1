import json
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch
import main

class BackendUnitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), main.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_health_endpoint(self):
        with urllib.request.urlopen(self.base + "/health", timeout=2) as response:
            body = json.loads(response.read().decode())
            self.assertEqual(response.status, 200)
            self.assertTrue(body["ok"])

    def test_chat_without_key_is_explicitly_disabled(self):
        with patch.object(main, "APP_API_TOKEN", "test-token"), patch.object(main, "API_KEY", ""):
            req = urllib.request.Request(self.base + "/chat", data=b'{"message":"hi"}', headers={"Content-Type": "application/json", "Authorization": "Bearer test-token"}, method="POST")
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                urllib.request.urlopen(req, timeout=2)
            self.assertEqual(ctx.exception.code, 503)
            body = json.loads(ctx.exception.read().decode())
            self.assertEqual(body["error"], "server_not_configured")

    def test_ai_endpoint_rejects_missing_access_token(self):
        with patch.object(main, "APP_API_TOKEN", "expected-token"):
            req = urllib.request.Request(self.base + "/chat", data=b'{"message":"hi"}', headers={"Content-Type": "application/json"}, method="POST")
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                urllib.request.urlopen(req, timeout=2)
            self.assertEqual(ctx.exception.code, 401)
            body = json.loads(ctx.exception.read().decode())
            self.assertEqual(body["error"], "unauthorized")

    def test_video_status_rejects_invalid_operation(self):
        with patch.object(main, "APP_API_TOKEN", "test-token"), patch.object(main, "API_KEY", "fake-key"):
            req = urllib.request.Request(self.base + "/video/status?operation=invalid", headers={"Authorization": "Bearer test-token"})
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                urllib.request.urlopen(req, timeout=2)
            self.assertEqual(ctx.exception.code, 400)
            body = json.loads(ctx.exception.read().decode())
            self.assertEqual(body["error"], "invalid_operation")

    def test_unknown_route_is_404(self):
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(self.base + "/unknown", timeout=2)
        self.assertEqual(ctx.exception.code, 404)

    def test_video_operation_validation_rule(self):
        self.assertTrue("operations/abc".startswith("operations/"))
        self.assertFalse("../../secret".startswith("operations/"))

if __name__ == "__main__":
    unittest.main()
