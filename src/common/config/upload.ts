import { v2 } from "cloudinary";
import { Request } from "express";
import { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export class UploadConfig {
  constructor() {
    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      secure: true
    });
  };

  storage(folder: string, type: 'image' | 'raw'): CloudinaryStorage {
    const storage = new CloudinaryStorage({
      cloudinary: v2,
      params: (req, file) => {
        return {
          folder: folder,
          public_id: new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname,
          resource_type: type
        };
      }
    })

    return storage;
  };

  fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
    const allowedMimetypes: string[] = ['image/png', 'image/heic', 'image/jpeg', 'image/webp', 'image/heif', 'application/pdf'];

    if (allowedMimetypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }

  deleteFile(filePath: string) {
    // Extract the public ID of the image from the file path
    const publicId = filePath.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, "");

    // Delete the uploaded image from Cloudinary
    v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      } else {
        console.log('Image deleted from Cloudinary');
      }
    })
  }
}