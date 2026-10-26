import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMarkers } from '../../context/MarkerContext';
import { ImageData } from '../../types';

export default function MarkerDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getMarkerById, updateMarkerImages, updateMarker } = useMarkers();
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const marker = getMarkerById(id as string);

  // Обновляем поля редактирования при загрузке маркера
  React.useEffect(() => {
    if (marker) {
      setEditTitle(marker.title);
      setEditDescription(marker.description);
    }
  }, [marker]);

  if (!marker) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Маркер не найден</Text>
        <Button title="Назад к карте" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const pickImage = async (useCamera: boolean = false) => {
    try {
      // Запрашиваем нужное разрешение
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Ошибка',
          `Необходимо разрешение на доступ к ${useCamera ? 'камере' : 'галерее'}`
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets.length > 0) {
        const newImage: ImageData = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        updateMarkerImages(marker.id, [...marker.images, newImage]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Добавить изображение',
      'Выберите источник',
      [
        { text: ' Камера', onPress: () => pickImage(true) },
        { text: '🖼️ Галерея', onPress: () => pickImage(false) },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const removeImage = (imageId: string) => {
    Alert.alert(
      'Удалить изображение?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            try {
              const updatedImages = marker.images.filter((img) => img.id !== imageId);
              updateMarkerImages(marker.id, updatedImages);
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить изображение');
            }
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditTitle(marker.title);
    setEditDescription(marker.description);
    setEditModalVisible(true);
  };

  const saveEdits = () => {
    if (!editTitle.trim()) {
      Alert.alert('Ошибка', 'Название не может быть пустым');
      return;
    }
    updateMarker(marker.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    setEditModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Заголовок с кнопкой редактирования */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{marker.title}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{marker.description}</Text>
      <Text style={styles.coordinates}>
        📍 {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
      </Text>

      <View style={styles.divider} />

      {/* Секция изображений */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Изображения ({marker.images.length})</Text>
        
        <View style={styles.addImageButton}>
          <Button 
            title=" Добавить изображение" 
            onPress={showImageSourceOptions} 
          />
        </View>
        
        <View style={styles.imageList}>
          {marker.images.length === 0 ? (
            <Text style={styles.emptyText}>Изображений пока нет</Text>
          ) : (
            marker.images.map((img: ImageData) => (
              <View key={img.id} style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={() => setPreviewImage(img.uri)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: img.uri }} style={styles.image} />
                </TouchableOpacity>
                <Button
                  title="Удалить"
                  color="#ff3b30"
                  onPress={() => removeImage(img.id)}
                />
              </View>
            ))
          )}
        </View>
      </View>
      
      <View style={styles.backButton}>
        <Button title="← Назад к карте" onPress={() => router.back()} />
      </View>

      {/* Модал предпросмотра изображения */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          )}
        </TouchableOpacity>
      </Modal>

      {/* Модал редактирования */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать маркер</Text>

            <Text style={styles.label}>Название *</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Введите название"
            />

            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Введите описание"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdits}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: { flex: 1 },
  title: { fontSize: 26, fontWeight: 'bold' },
  editButton: { padding: 8 },
  editIcon: { fontSize: 24 },
  description: { fontSize: 16, color: '#555', marginBottom: 12, lineHeight: 22 },
  coordinates: { fontSize: 14, color: '#007AFF', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  imageSection: { marginTop: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  addImageButton: { marginBottom: 15 },
  imageList: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  imageWrapper: { alignItems: 'center', width: 100 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
    width: '100%',
  },
  backButton: { marginTop: 30 },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Стили для предпросмотра
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  
  // Стили для модала редактирования
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#007AFF' },
  cancelButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});