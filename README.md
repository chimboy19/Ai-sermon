# AI Sermon Assistant 🕊️

A modern web application to help pastors and church leaders generate, refine, and repurpose sermons using AI (OpenAI & Gemini).

---

## ✨ Features & Tools

- **Sermon Generator**: Create a full sermon outline (Intro, 3 Points, Verse, Illustration) from any topic and Bible passage.
- **AI Repurposing**:
  - **Social Media**: Generate 5 ready-to-post graphics and captions.
  * **Blog Article**: Convert your sermon into a professional blog post.
  * **Devotional**: Create a 5-minute daily reading based on your message.
  * **Discussion Guide**: Generate 10 small-group questions.
- **AI Image Generation**: Create high-quality visual art for your sermon slides and social posts.
- **Sermon Library**: Save, edit, and organize all your past sermons in one dashboard.

---

## 🛠️ Step-by-Step Setup

### 1. Configure Firebase
1.  Create a project at [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Email/Password).
3.  Enable **Firestore Database**.
4.  Enable **Cloud Functions** (Pay-as-you-go / Blaze plan required).

### 2. Set Environment Variables
Create a file named `.env` in the root folder and add your Firebase keys:
```env
VITE_FIREBASE_API_KEY="your-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

### 3. Add AI API Keys (Cloud Secrets)
Run these commands in your terminal to securely store your API keys:
```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

---

## 🚀 Running & Deploying

### Local Development
To run the app on your computer:
```bash
npm install
npm run dev
```

### Deploying the AI Backend
Whenever you change the server code, run:
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Deploying the Website
Push your code to **GitHub** and connect it to **Vercel** for automatic hosting. 
*Note: Remember to add your `.env` variables in the Vercel Project Settings!*

---

## 💡 Quick Tips
- **Edit First**: You can manually edit any part of the AI-generated sermon before saving it to your library.
- **Image Generation**: The "Social" and "Blog" tools automatically suggest visual ideas; click the "Generate Image" button to see them come to life.
- **Auth Domains**: If your login fails on Vercel, make sure you've added your Vercel URL to the "Authorized Domains" list in Firebase Auth settings.

---

*Made with ❤️ for the global church.*
