# VanishVault Expo App

Mobile Expo implementation of VanishVault with Firebase Auth, Firestore, and Storage.

## Features
- Email/password auth (login, signup, forgot password)
- Protected dashboard
- Media upload (image/video/pdf) with expiry and self-destruct flags
- Secure viewer with watermark and screenshot prevention hook
- Views + viewedBy tracking

## Setup
1. Copy `.env.example` to `.env`
2. Fill `EXPO_PUBLIC_FIREBASE_*` values
3. Install deps: `npm install`
4. Run app: `npm start`

## Notes
- For production-grade secure link delivery and guaranteed server-side destruction, use Firebase Cloud Functions as trusted backend endpoints.
# VanishVaultApp
