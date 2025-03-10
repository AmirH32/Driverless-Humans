import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, View, Modal, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import api from "@/services/api";
import axios, { AxiosError } from 'axios';
import { useBackHistory } from '@/contexts/BackHistoryContext';
import { useFontSize } from '@/contexts/FontSizeContext';
import { speakText } from '@/services/ttsUtils';

export default function ProfileScreen() {
  // Back history
  const { goBack } = useBackHistory();

  // Font scaling
  const {fontScale, setFontScale} = useFontSize();
  const styles = createStyles(fontScale);

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
  const handleSavePassword = async() => {
    if (newPassword === confirmPassword && newPassword !== '') {
      try{
        const requestBody = {newPassword};
        const response = await api.post("/change_password", requestBody);
        if (response.data.success) {
          alert('Password successfully changed!');
          setPasswordModalVisible(false);
          setNewPassword('');
          setConfirmPassword('');
        } else {
          alert("Password change failed. " + response.data.message);
        }
      } catch (error: unknown) {
        // Handle Axios error
        if (axios.isAxiosError(error)) {
          // Check if error.response exists and contains a message
          if (error.response && error.response.data && error.response.data.message) {
            alert("Password change failed: " + error.response.data.message);
          } else {
            // Handle error without message (e.g., network issues)
            alert("Password change failed: Unknown error from the server.");
          }
        } else if (error instanceof Error) {
          // Generic JS error
          alert("Password change failed: " + error.message);
        } else {
          // Fallback for unknown errors
          alert("An unknown error occurred.");
        }
      }
    } else {
      alert('All fields are required.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.crossButton}
        onPress={() => goBack()}
      >
        <Text style={styles.crossText}>✕</Text>
      </TouchableOpacity>
    
      <ThemedText style={styles.title}>Profile</ThemedText>

      <TouchableOpacity
        style={[styles.button, styles.editButton]} 
        onPress={() => {setEditModalVisible(true); speakText('Edit profile button clicked')}}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.passwordButton]}
        onPress={() => {setPasswordModalVisible(true); speakText('Change password button clicked')}}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <View style={[styles.button, styles.notificationsBox]}>
        <Text style={styles.buttonText}>Toggle Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => {
            setNotificationsEnabled(value); // Update the state
            speakText(value ? 'Notifications are enabled' : 'Notifications are disabled'); // Speak based on the toggle
          }}
          trackColor={{ false: '#ccc', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#007BFF' : '#f4f3f4'}
        />
      </View>

      {/* Edit Profile Modal */}
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
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={() => speakText('Enter a new name field')}
            />
            <TextInput
              style={styles.input}
              placeholder="New Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              onFocus={() => speakText('Enter a new email field')}
            />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onFocus={() => speakText('Enter current password field')}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {setEditModalVisible(false); speakText('Cancel button pressed') }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  handleSaveProfile(); // Call the handleSaveProfile function
                  speakText('Save changes button pressed'); // Speak the text
                }}
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
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => speakText('Enter new password field')}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => speakText('Confirm new password field')}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {setPasswordModalVisible(false); speakText('Cancel button pressed'); }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  handleSavePassword(); // Call the handleSaveProfile function
                  speakText('Save password button pressed'); // Speak the text
                }}
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

const createStyles = (fontScale:number) => {
  return (
    StyleSheet.create({
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
        fontSize: 30 * fontScale,
        lineHeight: 30 * fontScale * 1.2,
        fontWeight: 'bold',
        color: '#FFFFFF',
      },
      title: {
        fontSize: 40 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40 * fontScale,
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
        fontSize: 25 * fontScale,
        lineHeight: 25 * fontScale * 1.2,
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
        fontSize: 24 * fontScale,
        lineHeight: 24 * fontScale * 1.2,
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
        fontSize: 18 * fontScale,
        lineHeight: 18 * fontScale * 1.2,
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
    })
  )
};
