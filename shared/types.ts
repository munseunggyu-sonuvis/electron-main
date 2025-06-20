export interface CaptureScreenPayload {
  success: boolean;
  filePath?: string;
  filename?: string;
  error?: string;
}

export type CaptureScreen = (msg: string) => Promise<CaptureScreenPayload>;
