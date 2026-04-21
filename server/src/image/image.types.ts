export interface ImageRating {
  imagination: number;
  composition: number;
  scenery: number;
  total: number;
}

export interface HighScoreReasons {
  imagination: string;
  composition: string;
  scenery: string;
}

export interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  uploadDate: Date;
  rating?: ImageRating;
  highScoreReasons?: HighScoreReasons;
  prompt?: string;
  deaiVersion?: string;
}
