# SocialConnect - Real-time Social Media App

SocialConnect is a powerful, real-time social networking application built using **React Native** and **Firebase**. It features a robust post-sharing system, user profiles with real-time updates, and a unique storage workaround for the Firebase free tier.

## 🚀 Key Features

- **Dynamic Feed**: Real-time post updates using Firestore subscriptions.
- **Smart Image Storage**: Custom Base64 compression engine to bypass Firebase Storage paid tier requirements.
- **User Discovery**: Case-insensitive search to find friends and community members.
- **Social Engagement**: Like posts with animations and real-time counter updates.
- **Profile Management**: Customizable bio and avatars stored directly in Cloud Firestore.
- **Friendship System**: Integrated friend request (sent/received/accepted) and follow system.

## 🛠 Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **UI Design**: [React Native Paper](https://reactnativepaper.com/) (Material Design)
- **Backend/Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Navigation**: [React Navigation](https://reactnavigation.org/)

## 📦 Installation & Setup

1. **Clone the project**
   ```bash
   git clone https://github.com/SHAYANkhanzada/SocialConnect.git
   cd SocialConnect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore Database** and **Authentication** (Email/Password).
   - Add your `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) to the respective native folders.
   - Update `src/services/firebase.ts` with your web configuration keys.

4. **Run the App**
   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

## 🔐 Security Rules

To ensure the app works correctly, apply the following rules in your Firestore Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---
Developed by **Shayan Akram** 🚀
