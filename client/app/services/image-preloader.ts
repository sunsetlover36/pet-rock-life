import { CRITICAL_IMAGES } from "~/config/images";

export class ImagePreloader {
  private static preloadedImages = new Set<string>();
  private static preloadPromises = new Map<string, Promise<HTMLImageElement>>();

  static preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src)!;
    }

    if (this.preloadedImages.has(src)) {
      return Promise.resolve(new Image());
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.preloadedImages.add(src);
        this.preloadPromises.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.preloadPromises.delete(src);
        console.warn(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  static async preloadImages(imagePaths: string[]): Promise<void> {
    try {
      const promises = imagePaths.map((src) => this.preloadImage(src));
      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error preloading images:", error);
    }
  }

  static async preloadCriticalImages(): Promise<void> {
    await this.preloadImages(CRITICAL_IMAGES);
  }

  static isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  static getPreloadStatus() {
    return {
      totalCritical: CRITICAL_IMAGES.length,
      preloaded: this.preloadedImages.size,
      inProgress: this.preloadPromises.size,
      completed: this.preloadedImages.size === CRITICAL_IMAGES.length,
    };
  }

  static clearCache(): void {
    this.preloadedImages.clear();
    this.preloadPromises.clear();
  }
}
