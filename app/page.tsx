"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");

  const createPaste = async () => {
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
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Simple Pastebin</h1>

      <textarea
        rows={10}
        cols={60}
        placeholder="Paste your text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br />
      <br />

      <button onClick={createPaste}>Create Paste</button>

      {link && (
        <div style={{ marginTop: "20px" }}>
          <p>Your paste link:</p>
          <a href={link} target="_blank">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}