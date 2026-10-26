import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, Marker } from 'react-native-maps';
import { useMarkers } from '../context/MarkerContext';
import { MarkerData } from '../types';
import AddMarkerModal from './AddMarkerModal';

export default function MapComponent() {
  const router = useRouter();
  const { markers, addMarker } = useMarkers();
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleLongPress = (event: LongPressEvent) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setPendingCoords({ latitude, longitude });
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать маркер');
    }
  };

  const handleCreateMarker = (title: string, description: string) => {
    if (!pendingCoords) return;

    const newMarker: MarkerData = {
      id: Date.now().toString(),
      latitude: pendingCoords.latitude,
      longitude: pendingCoords.longitude,
      title,
      description: description || 'Без описания',
      images: [],
    };

    addMarker(newMarker);
    setModalVisible(false);
    setPendingCoords(null);
    router.push(`/marker/${newMarker.id}` as any);
  };

  const handleMarkerPress = (id: string) => {
    router.push(`/marker/${id}` as any);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={handleLongPress}
        showsUserLocation
      >
        {markers.map((marker: MarkerData) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
      </MapView>

      <AddMarkerModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPendingCoords(null);
        }}
        onConfirm={handleCreateMarker}
        defaultTitle={`Маркер ${Date.now().toString().slice(-4)}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});