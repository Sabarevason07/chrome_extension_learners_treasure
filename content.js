chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "PING") {
    sendResponse("READY");
    return;
  }

  if (req.action === "GET_TRANSCRIPT") {
    smartTranscriptFetch();
  }
});

function smartTranscriptFetch() {
  const segments = document.querySelectorAll(
    "ytd-transcript-segment-renderer"
  );

  // Transcript already open → extract & structure
  if (segments.length > 0) {
    const structured = structureTranscript(segments);

    chrome.runtime.sendMessage({
      type: "TRANSCRIPT_READY",
      transcript: structured
    });
    return;
  }

  // Transcript not open → guide user
  highlightTranscriptButton();

  chrome.runtime.sendMessage({
    type: "TRANSCRIPT_READY",
    transcript:
      "⚠️ Transcript panel is not open.\n\n" +
      "Please click:\n" +
      "⋮ (three dots below video) → Show transcript\n\n" +
      "Then click 'Get Transcript' again."
  });
}

/* ---------- STRUCTURING LOGIC ---------- */

function structureTranscript(segments) {
  let output = "";
  let sectionText = [];
  let sectionStart = "";

  segments.forEach((seg, index) => {
    const timeEl = seg.querySelector(".segment-timestamp");
    const textEl = seg.querySelector(".segment-text");

    if (!timeEl || !textEl) return;

    const time = timeEl.innerText.trim();
    const text = textEl.innerText.trim();

    // Start new section every ~2 minutes OR first segment
    if (index === 0 || index % 10 === 0) {
      if (sectionText.length > 0) {
        output += formatSection(sectionStart, sectionText);
        sectionText = [];
      }
      sectionStart = time;
    }

    sectionText.push(text);
  });

  // Last section
  if (sectionText.length > 0) {
    output += formatSection(sectionStart, sectionText);
  }

  return output.trim();
}

function formatSection(startTime, texts) {
  return (
    `📌 Section starting at ${startTime}\n` +
    texts.map(t => `• ${t}`).join("\n") +
    "\n\n"
  );
}

/* ---------- UI HINT ---------- */

function highlightTranscriptButton() {
  const menuBtn = document.querySelector(
    "ytd-video-primary-info-renderer ytd-menu-renderer yt-icon-button button"
  );

  if (!menuBtn) return;

  menuBtn.scrollIntoView({ behavior: "smooth", block: "center" });

  menuBtn.style.outline = "3px solid red";
  menuBtn.style.borderRadius = "50%";

  setTimeout(() => {
    menuBtn.style.outline = "";
  }, 4000);
}
