import { createContext, ReactNode, useContext, useState } from 'react';
import { ImageData, MarkerData } from '../types';

interface MarkerContextType {
  markers: MarkerData[];
  addMarker: (marker: MarkerData) => void;
  updateMarkerImages: (id: string, images: ImageData[]) => void;
  updateMarker: (id: string, updates: Partial<MarkerData>) => void; // ← добавлено
  getMarkerById: (id: string) => MarkerData | undefined;
}

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export const MarkerProvider = ({ children }: { children: ReactNode }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const addMarker = (marker: MarkerData) => {
    setMarkers((prev) => [...prev, marker]);
  };

  const updateMarkerImages = (id: string, images: ImageData[]) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, images } : m))
    );
  };
  const updateMarker = (id: string, updates: Partial<MarkerData>) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const getMarkerById = (id: string) => markers.find((m) => m.id === id);

  return (
    <MarkerContext.Provider
      value={{
        markers,
        addMarker,
        updateMarkerImages,
        updateMarker, 
        getMarkerById,
      }}
    >
      {children}
    </MarkerContext.Provider>
  );
};

export const useMarkers = () => {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('useMarkers должен использоваться внутри MarkerProvider');
  }
  return context;
};