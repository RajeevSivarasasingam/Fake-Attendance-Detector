import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ScanSignSheet({ route, navigation }) {
  const { headcount, imageUri } = route.params || { headcount: 0 };
  const [sheetImage, setSheetImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSheetImage(result.assets[0].uri);
    }
  };

  const processSheet = async () => {
    if (!sheetImage) return;

    setLoading(true);
    let formData = new FormData();
    formData.append('file', {
      uri: sheetImage,
      name: 'signsheet.jpg',
      type: 'image/jpeg',
    });

    try {
      // POST the sign sheet to our OCR backend
      const response = await axios.post(`${API_BASE_URL}/sign-sheet`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { present_count, absent_count } = response.data;
      setLoading(false);
      
      navigation.navigate('VerificationResult', { 
        headcount, 
        present_count, 
        absent_count,
        classroomImageUri: imageUri 
      });
      
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to connect to the backend server for OCR processing.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Recorded Headcount: {headcount}</Text>
      
      {sheetImage ? (
        <Image source={{ uri: sheetImage }} style={styles.imagePreview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Scan Physical Sign-in Sheet</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Capture Sign-in Sheet</Text>
      </TouchableOpacity>

      {sheetImage && (
        <TouchableOpacity 
          style={[styles.button, styles.processButton]} 
          onPress={processSheet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Extract Attendance Data</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  placeholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  processButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
