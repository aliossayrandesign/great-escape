import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/upload-token";

// Client-side uploads (browser -> Blob storage directly) go through this
// route only to get a signed token — the file itself never passes through
// our own serverless function, avoiding request-body size limits.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload carries the short-lived token from /api/upload/token.
        // Without this check, anyone who found this endpoint could request
        // Blob upload tokens directly, with no tie to our own intake flow.
        if (!verifyUploadToken(clientPayload)) {
          throw new Error("Invalid or expired upload session");
        }
        return {
          allowedContentTypes: [
            "application/pdf",
            "image/*",
            "application/zip",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do server-side — the client picks up the resulting
        // URL directly from the upload() call and carries it through the
        // rest of the intake flow.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
