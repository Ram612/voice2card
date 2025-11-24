:root{--bg:#f6f8fb;--card:#fff;--muted:#6b7280;--accent:#0f172a}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,Arial,sans-serif;background:var(--bg);color:var(--accent);margin:0;padding:24px}
.wrap{max-width:1000px;margin:0 auto}
header h1{margin:0;font-size:22px}
header p.muted{color:var(--muted);margin:6px 0 18px}
.controls{display:flex;gap:20px;align-items:flex-start}
.left{flex:1}
.right{width:420px}
.file input{display:block;margin-top:8px}
.recorder{display:flex;align-items:center;gap:8px;margin-top:12px}
#recStatus{font-size:12px;color:var(--muted)}
textarea#manualText{width:100%;margin-top:12px;padding:10px;border-radius:8px;border:1px solid #e6eef8}
.actions{display:flex;gap:8px;margin-top:12px}
.card{display:flex;gap:12px;background:var(--card);padding:14px;border-radius:10px;box-shadow:0 10px 30px rgba(10,20,40,0.06)}
.photo img{width:120px;height:120px;object-fit:cover;border-radius:8px;border:1px solid #eee}
.info{flex:1}
.info h2{margin:0;font-size:18px}
.info p{margin:6px 0}
.tagline{color:#374151;font-style:italic}
.contacts div{font-size:13px;margin-top:6px}
.skills{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
.skills span{background:#eef2ff;padding:6px 8px;border-radius:6px;font-size:13px}
footer{margin-top:18px;color:var(--muted)}
