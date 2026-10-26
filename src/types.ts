export interface ImageData {
  id: string;
  uri: string;
}

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  images: ImageData[];
}