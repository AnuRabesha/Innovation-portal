"""
CSE Achievement Showcase Portal - Local Server
Run: python server.py
Then open: http://localhost:8080
"""
import http.server
import socketserver
import os
import sys
import webbrowser
import threading

# Fix Windows console encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        try:
            print("  {} -> {} {}".format(self.address_string(), args[0], args[1]))
        except Exception:
            pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def open_browser():
    import time
    time.sleep(1.5)
    webbrowser.open("http://localhost:{}/auth.html".format(PORT))

if __name__ == "__main__":
    try:
        with ReusableTCPServer(("", PORT), Handler) as httpd:
            print("=" * 52)
            print("  CSE Achievement Showcase Portal")
            print("=" * 52)
            print("  Server  : http://localhost:{}".format(PORT))
            print("  Home    : http://localhost:{}/showcase/index.html".format(PORT))
            print("  Submit  : http://localhost:{}/showcase/submit.html".format(PORT))
            print("  Auth    : http://localhost:{}/auth.html".format(PORT))
            print("  Press Ctrl+C to stop.")
            print("=" * 52)
            threading.Thread(target=open_browser, daemon=True).start()
            httpd.serve_forever()
    except OSError as e:
        print("\n  ERROR: Cannot start server on port {} - {}".format(PORT, e))
        input("  Press Enter to exit...")
    except KeyboardInterrupt:
        print("\n  Server stopped.")
