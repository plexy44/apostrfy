# Apostrfy connect || co-create

Apostrfy is an immersive, short-form writing experience where you connect and co-create stories with an advanced AI companion. It's a timed, creative writing game designed to help you tap into your flow, get emotionally unstuck, and surprise yourself without the pressure of a blank page.

✨ Key Features

AI Co-Creation: Write a story back-and-forth with a generative AI that adapts to your style and intent.

- Literary AI Personas: An AI "writer" archetypes associated with a list of writing styles users can pick from, like Noir Detective or Cosmic Wanderer to guide the story's tone.
- Timed Gameplay Modes: Engage in short, focused writing sessions with modes like "Lightning" (30s) and "Minute" (1m).
- Dragon Chasing Mode: A unique gameplay mode where thoughtful and substantial inputs "heal" the timer, rewarding creative momentum.
- Post-Game Analysis: Receive a sentiment snapshot of your story, a "mood wheel," and a match to the writing style of famous authors.
- Email Transcripts: Get a full transcript of your co-created story sent to your inbox via Mailgun.
- Monetization Ready: Integrated with Google AdSense for web and planned for AdMob for mobile deployment.

🛠️ Tech Stack

- Frontend: Next.js (with Turbopack), React, Tailwind CSS, Framer Motion
- Backend & Database: Firebase (Firestore, Authentication, Cloud Functions)
- AI: Google Gemini via Genkit
- Email Delivery: Mailgun

🚀 Getting Started

To get a local copy up and running, follow these simple steps.

# Prerequisites

- Node.js (v20 or higher)
- npm
- Firebase CLI ```npm install -g firebase-tools```

# Installation & Setup

Clone the repository:

Bash

```
git clone https://github.com/your-username/apostrfy.git
```
```
cd apostrfy
```


- Install frontend dependencies:


Bash

```
npm install
```


- Set up environment variables:

Create a file named .env.local in the root of the project and add your Firebase and Gemini API keys:


```
# Firebase Keys
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
# ...and other Firebase config keys
```

```
# Gemini AI Key
NEXT_PUBLIC_GEMINI_API_KEY="AIza..."
```


- Run the frontend development server:

Bash

```
npm run dev
```


- Backend Functions Setup

The email-sending function runs in a separate environment.

Navigate to the functions directory:

Bash

```
cd functions
```


- Install backend dependencies:

Bash

```
npm install
```


- Set secure backend configuration (replace with your actual keys and domain):

Bash

```
firebase functions:config:set mailgun.key="YOUR_MAILGUN_API_KEY"
```
```
firebase functions:config:set mailgun.domain="YOUR_MAILGUN_DOMAIN"
```


- Deploy the functions:

Bash

```
firebase deploy --only functions
```



- License

This project is licensed under the MIT License.

