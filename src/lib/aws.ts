// src/lib/aws.ts  (server-only)
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

export const AWS_REGION = process.env.AWS_REGION || "us-east-1";

export const bedrock = new BedrockRuntimeClient({
  region: AWS_REGION,
  // Provide a Promise<RequestSigner>
  signer: async (authScheme) =>
    new SignatureV4({
      service: authScheme?.signingName ?? "bedrock",
      region: AWS_REGION,
      credentials: defaultProvider(), // uses your env/CLI creds
      sha256: Sha256,
      uriEscapePath: false, // 👈 the key to avoid %253A
    }),
});

export const rekognition = new RekognitionClient({ region: AWS_REGION });
