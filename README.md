📘 Learners Treasure – Chrome Extension

Learners Treasure is a Chrome extension designed to enhance learning from YouTube educational videos by automatically extracting transcripts, generating AI-based summaries, and creating interactive quizzes for active learning.

🚀 Features

📄 Extract YouTube video transcripts

🗂️ Structured transcript with sections and bullet points

📌 AI-generated summaries using Groq AI

📝 Interactive multiple-choice quizzes

✅ Instant feedback with highlighted correct and wrong answers

🎯 Score calculation and congratulatory feedback

🎓 Designed for students and self-learners

🛠️ Technologies Used

JavaScript

HTML & CSS

Chrome Extension (Manifest V3)

Groq AI (LLaMA 3.1)

YouTube Transcript DOM Extraction

📥 Installation Steps

Clone or download this repository:

git clone https://github.com/Sabarevason07/chrome_extension_learners_treasure.git


Open Google Chrome and go to:

chrome://extensions


Enable Developer mode (top-right).

Click Load unpacked.

Select the project folder.

The Learners Treasure icon will appear in the toolbar.

📖 How to Use the Extension

Open any educational video on YouTube.

Click the Learners Treasure extension icon.

Click Get Transcript.

If the transcript panel is not open, follow the on-screen instruction:

Click ⋮ (three dots) → Show transcript

Click AI Summary to generate a concise explanation.

Click AI Quiz to generate interactive MCQs.

Select answers and click Submit Quiz.

View:

Score

Correct & wrong answers highlighted

Learning feedback message

🔐 Groq API Key Setup (Important)

This project uses Groq AI for summary and quiz generation.

Steps to add API key locally:

Create a free API key at:
👉 https://console.groq.com/keys

Open popup.js

Add your API key:

const GROQ_API_KEY = "YOUR_API_KEY_HERE";


⚠️ API keys are not included in this repository for security reasons.

🧠 Educational Benefits

Encourages active participation

Improves concept retention

Saves time through summaries

Converts passive video watching into interactive learning

🔒 Security Note

API keys are intentionally excluded from GitHub commits.

GitHub push protection is enabled to prevent secret leakage.

Users must add their own API keys locally.

🎓 Academic Relevance

This project demonstrates:

Chrome extension development

DOM manipulation

API integration

Secure coding practices

AI-assisted learning tools

Suitable for:

Mini projects

Web development labs


Screenshots:

1. popup screen
<img width="491" height="738" alt="image" src="https://github.com/user-attachments/assets/6c6c9b3e-fdda-4174-8d28-2b95fd0bae39" />


2. Transcript Section
![WhatsApp Image 2025-12-14 at 16 12 56](https://github.com/user-attachments/assets/b75ab0df-8cc9-4748-9f6a-cf3c85d8fbc0)


3. Summarize Section
![WhatsApp Image 2025-12-14 at 16 29 32](https://github.com/user-attachments/assets/8afe43ef-d691-4612-9aa3-08cc0f0faa90)


4. AI quiz
![WhatsApp Image 2025-12-14 at 16 29 23](https://github.com/user-attachments/assets/467c1b2c-6c87-42aa-88e9-93b758138bf9)


👨‍💻 Author

Sabarevason D
Chrome Extension & AI-based Learning Project

📜 License

This project is for educational purposes only.
