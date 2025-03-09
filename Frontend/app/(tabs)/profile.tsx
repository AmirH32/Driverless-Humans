import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, View, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api";
import axios, { AxiosError } from 'axios';

export default function ProfileScreen() {
  const router = useRouter();

  // State for both modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // State for Edit Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // State for Change Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for Notifications Toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Handle Save for Edit Profile
  const handleSaveProfile = async () => {
    if (name && email && currentPassword) {
      try{
        const requestBody = { name, email, currentPassword };
        const response = await api.post("/edit_profile", requestBody);
        if (response.data.success) {
          alert('Profile updated successfully!');
          setEditModalVisible(false);
          setName('');
          setEmail('');
          setCurrentPassword('');
        } else {
          alert("Profile change failed. " + response.data.message);
        }
      } catch (error: unknown) {
        // Handle Axios error
        if (axios.isAxiosError(error)) {
          // Check if error.response exists and contains a message
          if (error.response && error.response.data && error.response.data.message) {
            alert("Profile change failed: " + error.response.data.message);
          } else {
            // Handle error without message (e.g., network issues)
            alert("Profile change failed: Unknown error from the server.");
          }
        } else if (error instanceof Error) {
          // Generic JS error
          alert("Profile change failed: " + error.message);
        } else {
          // Fallback for unknown errors
          alert("An unknown error occurred.");
        }
      }
    } else {
      alert('All fields are required.');
    }
  };

  // Handle Save for Change Password
  const handleSavePassword = () => {
    if (newPassword === confirmPassword && newPassword !== '') {
      alert('Password successfully changed!');
      setPasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');

    } else {
      alert('Passwords do not match or fields are empty');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.crossButton}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.crossText}>✕</Text>
      </TouchableOpacity>

      <ThemedText style={styles.title}>Profile</ThemedText>

      <TouchableOpacity
        style={[styles.button, styles.editButton]} 
        onPress={() => setEditModalVisible(true)}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.passwordButton]}
        onPress={() => setPasswordModalVisible(true)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <View style={[styles.button, styles.notificationsBox]}>
        <Text style={styles.buttonText}>Toggle Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#ccc', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#007BFF' : '#f4f3f4'}
        />
      </View>

      {/* ✅ Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="New Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="New Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={!(name || email) || !currentPassword}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePassword}
                disabled={newPassword === '' || confirmPassword === '' || newPassword !== confirmPassword}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  crossButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
    zIndex: 1,
    marginTop: 40,
  },
  crossText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 2,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 25,
    borderRadius: 15,
    marginTop: 20,
    width: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 10,
    width: 300,
    backgroundColor: '#007BFF',
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    width: 350,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#7ed957',
    flex: 1,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    width: 100,
  },
});