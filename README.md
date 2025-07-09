

markdown
# 🧍‍♂️ Bad Posture Detection Web App

A full-stack rule-based web application that allows users to upload videos and receive posture analysis feedback frame by frame. This project was built as a technical assignment for Realfy.

---

## 📸 Features

- ✅ Upload posture videos
- ✅ Rule-based detection (no ML required)
- ✅ Frame-by-frame analysis
- ✅ Visual feedback with highlighted posture issues
- ✅ Clean, responsive UI

---

## 🚀 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- **Node.js**
- **Rule-based logic in TypeScript**

### Optional Enhancements
- **Pose Detection (Mediapipe or TensorFlow.js)**
- **Canvas / FFmpeg for video frame extraction**

---

## 📂 Folder Structure

```

/app
├── layout.tsx
├── page.tsx
└── api/
└── upload.ts     # Handles video uploads

/public
└── favicon.ico

/utils
└── postureRules.ts    # Custom rules to detect bad posture

/components
├── VideoUpload.tsx
├── ResultDisplay.tsx
└── PostureAnalyzer.tsx

````

---

## 🛠️ How It Works

1. **Upload Video** – User uploads a video file.
2. **Frame Extraction** – The app extracts individual frames from the video (via HTML5 video or backend tools).
3. **Rule Evaluation** – Each frame is checked for posture violations (e.g., back angle > 45°, neck forward etc.).
4. **Results** – Displays the frames marked with “bad posture” indicators visually.

---

## 📋 Rule-Based Detection Logic

Sample rules can include:
- Back angle > 45° = bad posture
- Head not aligned with spine = bad posture
- Neck leaning forward beyond threshold = bad posture

All rules are customizable in `/utils/postureRules.ts`.

---

## 🧪 Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
````

Then visit `http://localhost:3000`

---

## 📦 Deployment

You can deploy this app easily on:

* [Vercel](https://vercel.com)
* [Netlify](https://netlify.com)

Just push to GitHub and connect the repo.

---

## 📈 Future Improvements

* Real-time posture tracking
* Use ML models like PoseNet or Mediapipe
* User login + history of uploads
* Export report as PDF

---

## 🙌 Author

Made with ❤️ by \[Your Name] for the Realfy assignment.
Portfolio: \[your-portfolio-link.com]

---

## 📄 License

This project is for assessment/demo purposes only and is not licensed for commercial use.

```

---

### 🔧 Want me to customize it with:
- your GitHub link
- a working video rule example
- or auto-deploy setup?

Just ask — I’ll add it for you.
```
