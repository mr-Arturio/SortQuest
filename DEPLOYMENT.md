# SortQuest Deployment Guide

## Environment Variables Required

Add these to your Vercel deployment or `.env.local`:

### Firebase Configuration

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### JWT Secret for Session Tokens

```
SESSION_SECRET=your_jwt_secret_key_here
```

### AWS Bedrock Configuration

```
AWS_REGION=us-east-1
BEDROCK_VISION_MODEL_ID=amazon.nova-lite-v1:0
AWS_BEARER_TOKEN_BEDROCK=your_bedrock_bearer_token
```

### OpenAI Configuration (Optional)

```
OPENAI_API_KEY=your_openai_api_key
MAP_MODEL=gpt-4o-mini
```

### Demo Mode (Optional)

```
NEXT_PUBLIC_DEMO_NO_QR=0
```

## Installation Steps

1. Install dependencies:

```bash
npm install jsonwebtoken @types/jsonwebtoken firebase-admin
```

2. Set up Firebase Admin SDK:

   - Download your service account key from Firebase Console
   - Set up authentication (either service account or application default credentials)

3. Configure Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Block direct writes to user points
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && !('points' in request.resource.data);
    }

    // Block direct writes to sessions
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

## Testing

1. Test Bedrock connection:

```bash
curl -X GET https://your-domain.com/api/bedrock-ping
```

2. Test scan recognition:
   - Create a team and get a BinTag QR
   - Scan an item with the QR visible
   - Verify points are awarded and session allowance decrements

## Features Implemented

✅ JWT session token verification
✅ Transactional point awarding
✅ Real-time scan processing
✅ BinTag QR verification
✅ Server-side AI recognition
✅ Anti-cheat measures
✅ Privacy-first design
✅ Mobile-optimized interface

## Security Notes

- All server-side API keys are kept secure (never NEXT*PUBLIC*\*)
- JWT tokens expire after 5 minutes
- Session allowance limits prevent spam
- Perceptual hashing prevents duplicates
- Motion detection prevents static scans
