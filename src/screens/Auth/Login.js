import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Touchable, TouchableOpacity } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { userContext } from '../../context/UserContext';
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Login = ({ navigation }) => {
  // TODO IMPLEMENT FORGOT PASSWORD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser } = useContext(userContext);

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.upperText}>
        Welcome!
      </Text>

      <View style={{ height: 30, }}>
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>


      <View style={styles.lowerContainer}>
        <View style={{ width: '100%' }}>
          <Text style={styles.inputHeader}>
            Enter UW NetID
          </Text>
          <TextInput
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
          />
        </View>

        <View style={{ width: '100%' }}>
          <Text style={styles.inputHeader}>
            Password
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Log in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('EmailOnboarding')}
        hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Sign up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { console.log('FORGOT PASSWORD') }}>
        <Text style={styles.link} onPress={() => navigation.navigate('EmailOnboarding')}>
          Forgot password?
        </Text>
      </TouchableOpacity>

    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    height: 35,
    paddingHorizontal: 12,
    // shadow
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  error: {
    color: 'red',
    fontFamily: 'inter',
  },
  link: {
    color: 'blue',
    marginTop: 15,
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: '10%'
  },
  upperText: {
    fontSize: 26,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold'
  },
  lowerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 140,
  },
  inputHeader: {
    fontSize: 16,
    marginLeft: 5,
    marginBottom: 6,
    fontFamily: 'inter'
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'gray',
    width: '100%',
    height: 40, display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50, marginTop: 20
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'inter',
    color: 'white',
    fontWeight: '400',
  },
});

export default Login;