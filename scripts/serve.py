"""Serve locally, optionally reproducing GitHub Pages' subfolder deployment."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
from urllib.parse import urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('--port',type=int,default=4175)
parser.add_argument('--base',default='/')
args = parser.parse_args()
root = str(Path(__file__).resolve().parent.parent)
prefix = '/' + args.base.strip('/') + '/' if args.base.strip('/') else '/'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**k):
        super().__init__(*a,directory=root,**k)
    def do_GET(self):
        path = urlsplit(self.path).path
        if not path.startswith(prefix):
            self.send_error(404)
            return
        self.path = '/' + self.path[len(prefix):]
        super().do_GET()
    def log_message(self,*a):
        pass

print(f'Local preview: http://127.0.0.1:{args.port}{prefix}',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
