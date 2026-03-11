"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by waiting until the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const createPaste = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      setLink(data.url);
    } catch (error) {
      console.error("Failed to create paste", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (!mounted) return null;

  return (
    <div style={styles.container}>
      {/* Background Glowing Blobs */}
      <div style={styles.glowBlobTop}></div>
      <div style={styles.glowBlobBottom}></div>

      <div style={styles.contentWrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.titleGradient}>Simple</span> Pastebin
          </h1>
          <p style={styles.subtitle}>Securely share your text snippets in seconds.</p>
        </header>

        <main className="main-card-animation" style={styles.mainCard}>
          <div style={styles.inputGroup}>
            <textarea
              placeholder="Type or paste your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={styles.textarea}
              spellCheck="false"
            />
          </div>

          <button
            onClick={createPaste}
            disabled={isSubmitting || !content.trim()}
            style={{
              ...styles.button,
              ...(isSubmitting || !content.trim() ? styles.buttonDisabled : {}),
            }}
          >
            {isSubmitting ? (
              <span style={styles.loadingContainer}>
                <svg className="spinner" viewBox="0 0 50 50" style={styles.spinner}>
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor" strokeLinecap="round" strokeDasharray="90, 150" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Paste"
            )}
          </button>

          {link && (
            <div style={styles.resultContainer}>
              <p style={styles.resultLabel}>Your paste is ready:</p>
              <div style={styles.linkWrapper}>
                <a href={link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {link}
                </a>
                <button 
                  onClick={copyToClipboard} 
                  style={styles.copyButton} 
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Developed by <strong style={styles.footerStrong}>Sricharan Boggavarapu</strong>
        </p>
        <div style={styles.footerLinks}>
          <a
            href="https://www.linkedin.com/in/boggavarapu-sricharan"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            LinkedIn
          </a>
          <span style={styles.separator}>•</span>
          <a
            href="https://github.com/Sricharan-boggavarapu"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* Global Styles injected here for modularity and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        body {
          margin: 0;
          background-color: #0f172a;
          color: #f8fafc;
          overflow-x: hidden;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .main-card-animation {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        textarea {
          transition: all 0.3s ease;
        }
        
        textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
          border-color: #3b82f6 !important;
        }

        button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        a {
          transition: color 0.2s ease;
        }
        
        a:hover {
          color: #60a5fa !important;
        }

        /* Custom Scrollbar for Textarea */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 8px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}

// Inline Styles Object
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  glowBlobTop: {
    position: "absolute",
    top: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none",
  },
  glowBlobBottom: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "700",
    margin: "0 0 12px 0",
    letterSpacing: "-0.03em",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.15rem",
    color: "#94a3b8",
    margin: 0,
  },
  mainCard: {
    background: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "40px",
    width: "100%",
    maxWidth: "640px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  textarea: {
    width: "100%",
    minHeight: "240px",
    padding: "20px",
    fontSize: "16px",
    lineHeight: "1.6",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    color: "#f8fafc",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "16px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  spinner: {
    width: "20px",
    height: "20px",
  },
  resultContainer: {
    marginTop: "30px",
    padding: "20px",
    background: "rgba(16, 185, 129, 0.05)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "16px",
    animation: "fadeIn 0.5s ease-out forwards",
  },
  resultLabel: {
    margin: "0 0 12px 0",
    fontSize: "0.85rem",
    color: "#34d399",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  linkWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(15, 23, 42, 0.6)",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  link: {
    color: "#f8fafc",
    textDecoration: "none",
    fontSize: "1rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginRight: "16px",
  },
  copyButton: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  footer: {
    padding: "30px",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    zIndex: 1,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    margin: "0 0 12px 0",
  },
  footerStrong: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  separator: {
    color: "#475569",
    fontSize: "0.8rem",
  },
};
