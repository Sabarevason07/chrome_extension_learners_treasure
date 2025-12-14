const output = document.getElementById("output");
let cachedTranscript = "";

/* 🔐 PUT YOUR GROQ API KEY HERE (starts with gsk_) */
const GROQ_API_KEY = localStorage.getItem("GROQ_API_KEY");


/* ---------- HELPERS ---------- */

// Very safe trimming for Groq
function safeTrim(text) {
  return text.replace(/\s+/g, " ").slice(0, 1800);
}

// Get active YouTube tab
async function getYouTubeTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.url?.includes("youtube.com/watch")) {
    output.textContent = "❌ Open a YouTube video page.";
    return null;
  }
  return tab;
}

// Ensure content.js is injected
async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "PING" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }
}

/* ---------- GET TRANSCRIPT ---------- */

document.getElementById("transcript").onclick = async () => {
  const tab = await getYouTubeTab();
  if (!tab) return;

  await ensureContentScript(tab.id);
  chrome.tabs.sendMessage(tab.id, { action: "GET_TRANSCRIPT" });

  output.textContent = "⏳ Fetching transcript...";
};

// Receive transcript
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "TRANSCRIPT_READY") {
    cachedTranscript = msg.transcript;
    output.textContent = cachedTranscript.slice(0, 1500) + "...";
  }
});

/* ---------- AI SUMMARY (GROQ) ---------- */
document.getElementById("summary").onclick = async () => {
  if (!cachedTranscript) {
    output.textContent = "❌ Get transcript first.";
    return;
  }

  output.textContent = "🧠 Generating AI summary...";
  const text = safeTrim(cachedTranscript);

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You summarize educational video transcripts."
            },
            {
              role: "user",
              content: `Summarize this lecture clearly and completely:\n\n${text}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300     /* 🔥 INCREASED */
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Groq Summary Error:", data);
      output.textContent = "⚠️ Summary failed. Check console.";
      return;
    }

    output.textContent = data.choices[0].message.content;

  } catch (err) {
    console.error(err);
    output.textContent = "❌ Network error during summary.";
  }
};

let quizData = [];

/* ---------- AI QUIZ (GROQ - INTERACTIVE) ---------- */

document.getElementById("quiz").onclick = async () => {
  if (!cachedTranscript) {
    output.textContent = "❌ Get transcript first.";
    return;
  }

  output.textContent = "📝 Generating interactive quiz...";
  document.getElementById("submitQuiz").style.display = "none";

  const text = safeTrim(cachedTranscript);

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
`Generate a quiz STRICTLY in this format:
Q1: Question
A) option
B) option
C) option
D) option
Answer: A

Generate exactly 5 questions.`
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.4,
          max_tokens: 700
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Groq Quiz Error:", data);
      output.textContent = "⚠️ Quiz failed. Check console.";
      return;
    }

    quizData = parseQuiz(data.choices[0].message.content);
    renderQuiz(quizData);

  } catch (err) {
    console.error(err);
    output.textContent = "❌ Network error during quiz.";
  }
};

/* ---------- PARSE QUIZ ---------- */

function parseQuiz(text) {
  const blocks = text.split(/Q\d+:/).slice(1);

  return blocks.map(block => {
    const lines = block.trim().split("\n");
    const question = lines[0];

    const options = lines
      .filter(l => /^[A-D]\)/.test(l))
      .map(l => l.slice(3).trim());

    const answerLine = lines.find(l => l.startsWith("Answer"));
    const answer = answerLine.split(":")[1].trim();

    return { question, options, answer };
  });
}

/* ---------- RENDER QUIZ ---------- */

function renderQuiz(quiz) {
  output.innerHTML = "";
  document.getElementById("submitQuiz").style.display = "block";

  quiz.forEach((q, i) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";
    qDiv.textContent = `${i + 1}. ${q.question}`;

    const optDiv = document.createElement("div");
    optDiv.className = "quiz-options";

    q.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      const value = String.fromCharCode(65 + idx);

      label.innerHTML = `
        <input type="radio" name="q${i}" value="${value}">
        ${value}) ${opt}
      `;
      optDiv.appendChild(label);
    });

    output.appendChild(qDiv);
    output.appendChild(optDiv);
  });
}

/* ---------- SUBMIT QUIZ ---------- */

document.getElementById("submitQuiz").onclick = () => {
  let score = 0;

  quizData.forEach((q, i) => {
    const selected = document.querySelector(
      `input[name="q${i}"]:checked`
    );

    const options = document.querySelectorAll(
      `input[name="q${i}"]`
    );

    options.forEach(opt => {
      const label = opt.parentElement;

      // Correct answer
      if (opt.value === q.answer) {
        label.classList.add("correct-option");
        label.innerHTML +=
          `<span class="answer-tag">(Correct)</span>`;
      }

      // Wrong selected answer
      if (selected && opt === selected && opt.value !== q.answer) {
        label.classList.add("wrong-option");
        label.innerHTML +=
          `<span class="answer-tag">(Your choice)</span>`;
      }
    });

    if (selected && selected.value === q.answer) {
      score++;
    }
  });

  // Final result message
  const resultDiv = document.createElement("div");
  resultDiv.innerHTML = `
<hr>
<b>Score: ${score} / ${quizData.length}</b><br><br>
<span class="${
    score >= 4 ? "result-good" : "result-bad"
  }">
${score >= 4
    ? "🎉 Congratulations! Excellent work!"
    : "📘 Keep practicing, you’ll improve!"}
</span>
  `;

  output.appendChild(resultDiv);

  document.getElementById("submitQuiz").style.display = "none";
};
