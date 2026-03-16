import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VerificationResult({ route, navigation }) {
  const { headcount, present_count, absent_count, classroomImageUri } = route.params;
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faceRecLoading, setFaceRecLoading] = useState(false);
  const [identifiedStudents, setIdentifiedStudents] = useState([]);

  useEffect(() => {
    verifyAttendance();
  }, []);

  const verifyAttendance = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify?headcount=${headcount}&present_count=${present_count}&absent_count=${absent_count}`
      );
      setVerificationResult(response.data);
    } catch (error) {
      Alert.alert('Error', 'Verification failed.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFaceRecognition = async () => {
    if (!classroomImageUri) {
        Alert.alert('Error', 'No classroom image available for facial recognition.');
        return;
    }

    setFaceRecLoading(true);
    let formData = new FormData();
    formData.append('file', {
      uri: classroomImageUri,
      name: 'classroom_face_rec.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/face-recognition`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setIdentifiedStudents(response.data.identified_students);
    } catch (error) {
      Alert.alert('Error', 'Facial recognition failed.');
      console.error(error);
    } finally {
      setFaceRecLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 10}}>Verifying Data...</Text>
      </View>
    );
  }

  const isMatch = verificationResult?.match;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, isMatch ? styles.cardSuccess : styles.cardDanger]}>
        <Text style={styles.cardTitle}>
          {isMatch ? "Verification Successful" : "Mismatch Detected!"}
        </Text>
        <Text style={styles.cardText}>{verificationResult?.status}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Physical Headcount</Text>
          <Text style={styles.statValue}>{headcount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Sign-in Present</Text>
          <Text style={styles.statValue}>{present_count}</Text>
        </View>
      </View>

      {!isMatch && (
        <View style={styles.resolutionContainer}>
            <Text style={styles.resolutionText}>
                The number of people in the room does not match the sign-in sheet.
                Run facial recognition on the classroom photo to identify exactly who is present.
            </Text>
            
            <TouchableOpacity 
                style={styles.button} 
                onPress={triggerFaceRecognition}
                disabled={faceRecLoading}
            >
                {faceRecLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Run Facial Recognition</Text>
                )}
            </TouchableOpacity>

            {identifiedStudents.length > 0 && (
                <View style={styles.resultsList}>
                    <Text style={styles.resultsTitle}>Identified Students:</Text>
                    {identifiedStudents.map((student, index) => (
                        <Text key={index} style={styles.studentName}>• {student}</Text>
                    ))}
                </View>
            )}
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.outlineButton, {marginTop: 30}]} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={[styles.buttonText, {color: '#007AFF'}]}>Return to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  cardDanger: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
  },
  resolutionContainer: {
      backgroundColor: '#fff3cd',
      padding: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ffeeba'
  },
  resolutionText: {
      color: '#856404',
      marginBottom: 15,
      fontSize: 15,
      lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsList: {
      marginTop: 20,
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 8,
  },
  resultsTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
  },
  studentName: {
      fontSize: 16,
      marginBottom: 5,
      color: '#333',
  }
});
