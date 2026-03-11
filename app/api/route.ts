import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

// Prevent XSS attacks when rendering raw HTML
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  const body = await req.json();

  const { content, expire_after_views, expire_after_seconds } = body;

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const id = nanoid(8);
  let expireAt = null;

  if (expire_after_seconds) {
    // Convert seconds to a future Date
    expireAt = new Date(Date.now() + expire_after_seconds * 1000);
  }

  const paste = await prisma.paste.create({
    data: {
      id,
      content,
      expireAt,
      // Default max views = 5 as per your logic
      maxViews: expire_after_views ?? 5,
    },
  });

  return Response.json({
    id: paste.id,
    url: `${new URL(req.url).origin}/api?id=${paste.id}`,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const isRaw = searchParams.get("raw") === "true"; // Provide a way to get raw pure text

  // Reusable error HTML render function
  const renderErrorNode = (title: string, message: string, status: number) => {
    if (isRaw) return new Response(message, { status });
    return new Response(
      errorHtmlTemplate(title, message),
      { status, headers: { "Content-Type": "text/html" } }
    );
  };

  if (!id) return renderErrorNode("Bad Request", "Missing paste ID required to fetch.", 400);

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) return renderErrorNode("404 Not Found", "This paste doesn't exist or was deleted.", 404);

  // Expire by time
  if (paste.expireAt && new Date() > paste.expireAt) {
    return renderErrorNode("Expired", "This paste has expired due to time limits.", 410);
  }

  const newViews = paste.views + 1;

  // Expire by views
  if (paste.maxViews && newViews > paste.maxViews) {
    return renderErrorNode("Limit Reached", "This paste has reached its maximum view limit.", 410);
  }

  // Update view count in DB
  await prisma.paste.update({
    where: { id },
    data: { views: newViews },
  });

  // If the user requested raw text, send classic text/plain
  if (isRaw) {
    return new Response(`${paste.content}\n\nViews: ${newViews}`, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Otherwise, return the beautifully styled Glassmorphic viewing page!
  const htmlResult = successHtmlTemplate(
    escapeHtml(paste.content), 
    newViews, 
    paste.maxViews ?? "∞"
  );

  return new Response(htmlResult, {
    headers: { "Content-Type": "text/html" },
  });
}


// --- BEAUTIFUL HTML TEMPLATES FOR THE BROWSER ---

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
  body { 
    margin: 0; 
    background-color: #0f172a; 
    color: #f8fafc; 
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: 
      radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.15) 0%, transparent 40%);
  }
  .card {
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 40px;
    width: 90%;
    max-width: 800px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  h1 { margin: 0; font-size: 1.5rem; color: #fff; }
  .badge {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }
  pre {
    background: rgba(15, 23, 42, 0.8);
    padding: 24px;
    border-radius: 12px;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,0.05);
    font-family: monospace;
    font-size: 15px;
    line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  pre::-webkit-scrollbar { height: 8px; width: 8px; }
  pre::-webkit-scrollbar-track { background: transparent; }
  pre::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  
  .actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  }
  .btn {
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;
  }
  .btn-primary:hover { box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5); transform: translateY(-2px); }
  .btn-secondary {
    background: rgba(255,255,255,0.1);
    color: white;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
`;

function successHtmlTemplate(safeContent: string, views: number, maxViews: string | number) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure Paste</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>📄 Secure Paste</h1>
          <span class="badge">👀 Views: ${views} / ${maxViews}</span>
        </div>
        
        <pre id="paste-content">${safeContent}</pre>
        
        <div class="actions">
          <a href="/" class="btn btn-secondary">Create New</a>
          <button onclick="copyToClipboard()" class="btn btn-primary" id="copy-btn">
            📋 Copy Text
          </button>
        </div>
      </div>

      <script>
        function copyToClipboard() {
          const content = document.getElementById('paste-content').innerText;
          navigator.clipboard.writeText(content).then(() => {
            const btn = document.getElementById('copy-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
          });
        }
      </script>
    </body>
    </html>
  `;
}

function errorHtmlTemplate(title: string, message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="card" style="text-align: center; max-width: 500px;">
        <h1 style="color: #ef4444; font-size: 2.5rem; margin-bottom: 16px;">⚠️</h1>
        <h2 style="margin: 0 0 12px 0;">${title}</h2>
        <p style="color: #94a3b8; font-size: 1.1rem; margin-bottom: 30px;">${message}</p>
        <a href="/" class="btn btn-primary" style="justify-content: center; width: 100%;">Return Home</a>
      </div>
    </body>
    </html>
  `;
}
