export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
}

export interface ImageData {
  id: string;
  filename: string;
  url: string; // Can be regular URL or base64 data URL
  size?: number;
  uploadedAt?: Date;
  tags?: string[];
  mimeType?: string; // Optional MIME type for better handling
  isBase64?: boolean; // Optional flag to explicitly mark base64 images
}

export interface UploadResponse {
  uploadedImages: ImageData[];
  failedUploads?: string[];
  totalSize: number;
}

export interface MockApiConfig {
  baseUrl: string;
  delayMs: number;
  successRate: number;
}
