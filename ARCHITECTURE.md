# SortQuest Architecture

This diagram shows core technologies and how they interact.

```mermaid
flowchart TB
  subgraph Client[Web App (Next.js 15, TS, Tailwind)]
    UI[UI Components\nCameraScanner, ResultCard, etc.]
    TFJS[@tensorflow/tfjs\nMobileNet + COCO]
    jsQR[jsQR]
    PWA[PWA + Service Worker]
  end

  subgraph Firebase[Firebase]
    Auth[Anonymous Auth]
    Firestore[(Firestore\nscans, teams, bins, users)]
  end

  subgraph Server[Next.js API Routes]
    MapAPI[/api/map\n(rule mapping)]
    VerifyQR[/api/bintag/verify\n(issue session token)]
    Recognize[/api/scan/recognize\nserver vision + scoring]
    BedrockPing[/api/bedrock-ping]
  end

  subgraph AWS[AWS]
    Bedrock[Nova Lite Vision]
  end

  subgraph Libs[Shared Lib]
    Vision[vision.ts\n(detectPrimaryROI, classify, mergeLabels)]
    Mapping[mapping.ts]
    Points[points2.ts\n(computePoints)]
    Session[session.ts]
    FirebaseLib[firebase.ts]
    Hash[ahash.ts/hamming.ts]
    Rules[rules.ts/materials.ts]
  end

  Camera((Device Camera))
  BinTag[[BinTag QR]]

  Camera --> UI
  BinTag --> UI
  UI <--> TFJS
  UI <--> jsQR
  UI -->|scan results| Firestore
  UI -->|verify QR| VerifyQR
  VerifyQR --> Auth
  VerifyQR --> Firestore
  UI -->|recognize (frame+token)| Recognize
  Recognize --> Bedrock
  Recognize --> Firestore

  UI <--> Vision
  UI <--> Mapping
  UI <--> Points
  UI <--> Hash
  Server <--> Rules
  Server <--> Mapping
  Server <--> Points
  Server <--> FirebaseLib
```

Notes

- Client performs on-device detection (COCO) and classification (MobileNet), QR reading, motion gating, and duplicate checks.
- Server endpoint optionally refines recognition with AWS Bedrock and writes canonical scan records.
- Firestore stores scans, teams, bins, and user totals via Anonymous Auth.
- `computePoints` applies log-scaled impact, material multipliers, risk, and frequency adjustments.
