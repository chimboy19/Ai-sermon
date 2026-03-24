# AI Sermon Assistant 🕊️

A powerful, modern web application designed to help pastors and church leaders generate, refine, and repurpose sermons using cutting-edge AI (OpenAI & Google Gemini).

---

## 🚀 Key Features

- **Dynamic Sermon Generation**: Create structured sermons with introductions, 3 points, verses, and illustrations based on a topic and Bible passage.
- **AI Repurposing**: Instantly convert your sermon into Social Media posts, a Blog Article, a Devotional, or Discussion Questions.
- **AI Image Generation**: Automatically generate professional visual art for your sermon slides and social posts using DALL-E 3.
- **Library Management**: Save your sermons to Firebase and access or edit them anytime.
- **Multi-Provider Backend**: Seamlessly switches between OpenAI and Gemini with a priority on OpenAI for premium quality.

---

## 📁 Project Structure

### Frontend (`/src`)
- **`pages/LandingPage.tsx`**: The front door of the app. A premium, high-converting introduction to the tool.
- **`pages/GeneratorPage.tsx`**: The "engine room" where you input your topic, Bible passage, and style to generate a new sermon.
- **`pages/SermonViewPage.tsx`**: The main workspace for a specific sermon. Here you can edit the text, download AI images, and run the repurposing tools.
- **`pages/LibraryPage.tsx`**: A dashboard to browse all your saved sermons and quickly jump back into past work.
- **`services/geminiService.ts`**: The secure bridge between the frontend and our Firebase Cloud Functions.

### Backend Configuration (`/functions`)
The files in the `/functions` directory were initialized using the **Firebase CLI** and then customized:
- **`package.json`**: Created via `firebase init functions`. It manages backend dependencies like `openai` and `@google/generative-ai`.
- **`tsconfig.json`**: Configured for **Node.js 16+** and **TypeScript**. We updated this file specifically to set `"module": "node16"` to support modern Firebase v2 imports.
- **`firebase.json`**: Located at the root, it tells the CLI where the backend code lives and which functions it should deploy.

---

## 🛠️ Setup & Deployment

### 1. Environment Variables
In the root `/` directory, create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

### 2. Configure AI API Keys (Secrets)
We use **Firebase Secret Manager** to keep your API keys safe. Run these commands from your terminal:
```bash
# Set your OpenAI Key
firebase functions:secrets:set OPENAI_API_KEY

# Set your Gemini Key
firebase functions:secrets:set GEMINI_API_KEY
```

### 3. Deploy Cloud Functions
The backend must be built and deployed for the AI features to work:
```bash
# Step inside the functions folder
cd functions

# Install dependencies and build the TypeScript
npm install
npm run build

# Step back to root and deploy
cd ..
firebase deploy --only functions
```

### 4. Deploy Frontend (Vercel)
For the frontend, we recommend using **Vercel**. 
👉 **[Read the Full Vercel Deployment Guide](VERCEL_DEPLOY.md)**

### 5. Set Public Permissions (Grant 403 Access)
By default, new functions are "private." To allow your website to call them:
1. Go to the [Google Cloud Console - Cloud Run](https://console.cloud.google.com/run).
2. For each function (`generateSermon`, `repurposeSermon`, etc.):
   - Under **Security** or **Permissions**, add a new principal.
   - Principal: `allUsers`
   - Role: **Cloud Run Invoker**
   - Click **Confirm/Confirm Public Access**.

---

## 💡 Usage Tips
- **OpenAI Priority**: The system is designed to check for an `OPENAI_API_KEY` first. If it finds one (and it's not a placeholder), it will use OpenAI's `gpt-4o-mini` and `dall-e-3` for the best results.
- **Trial System**: The app currently has a built-in trial limit of 4 sermons per user (tracked via user profile in Firestore).
- **Edit Mode**: If the AI output isn't perfect, use the "Edit Sermon" button inside the Sermon View to refine any section before saving.

---

*Made with ❤️ for the global church.*
