"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");

  const createPaste = async () => {
    if (!content.trim()) return;

    const res = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();
    setLink(data.url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        fontFamily: "Arial",
        background: "#f5f5f5",
      }}
    >
      <div>
        <h1 style={{ marginBottom: "20px" }}>Simple Pastebin</h1>

        <textarea
          rows={10}
          cols={60}
          placeholder="Paste your text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: "600px",
          }}
        />

        <br />
        <br />

        <button
          onClick={createPaste}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            background: "#0070f3",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create Paste
        </button>

        {link && (
          <div style={{ marginTop: "20px" }}>
            <p>Your paste link:</p>
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
          fontSize: "14px",
        }}
      >
        <p>
          Developed by <strong>Sricharan Boggavarapu</strong>
        </p>

        <p>
          <a
            href="www.linkedin.com/in/boggavarapu-sricharan"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/Sricharan-boggavarapu"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}