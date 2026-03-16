import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// Ensure your physical device and backend are on the same network
// Repace with your machine's local IP Address (e.g., http://192.168.1.5:8000)
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function CaptureClassroom({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    let formData = new FormData();
    formData.append('file', {
      uri: image,
      name: 'classroom.jpg',
      type: 'image/jpeg',
    });

    try {
      // POST the classroom image to our YOLOv8 backend
      const response = await axios.post(`${API_BASE_URL}/headcount`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const headcount = response.data.headcount_total;
      setLoading(false);
      
      Alert.alert(
        "Headcount Detected", 
        `System counted ${headcount} students in the classroom.`,
        [
          { 
            text: "Proceed to Scan Sheet", 
            onPress: () => navigation.navigate('ScanSignSheet', { headcount, imageUri: image }) 
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to connect to the backend server for AI processing.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image captured</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo of Classroom</Text>
      </TouchableOpacity>

      {image && (
        <TouchableOpacity 
          style={[styles.button, styles.processButton]} 
          onPress={processImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Submit for AI Headcount</Text>
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
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
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
