import { UploadedImage } from './image.types';
export declare class ImageService {
    private uploadedImages;
    private sampleHighScoreImages;
    getAllHighScoreImages(): UploadedImage[];
    getImageById(id: string): UploadedImage | undefined;
    uploadImage(file: Express.Multer.File): Promise<UploadedImage>;
    rateImage(id: string): Promise<UploadedImage>;
    generatePrompt(id: string): Promise<UploadedImage>;
    deaiImage(id: string): Promise<UploadedImage>;
    getAllDeaiImages(): UploadedImage[];
    private generateRandomRating;
    private generateHighScoreReasons;
    private generateRandomPrompt;
    getUploadsDir(): string;
}
