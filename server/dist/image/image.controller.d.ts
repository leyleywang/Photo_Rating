import { ImageService } from './image.service';
export declare class ImageController {
    private readonly imageService;
    constructor(imageService: ImageService);
    getHighScoreImages(): import("./image.types").UploadedImage[];
    getImageById(id: string): import("./image.types").UploadedImage;
    uploadImage(file: Express.Multer.File): Promise<import("./image.types").UploadedImage>;
    rateImage(id: string): Promise<import("./image.types").UploadedImage>;
    generatePrompt(id: string): Promise<import("./image.types").UploadedImage>;
    deaiImage(id: string): Promise<import("./image.types").UploadedImage>;
    getDeaiImages(): import("./image.types").UploadedImage[];
}
