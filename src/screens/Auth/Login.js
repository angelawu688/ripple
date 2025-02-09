import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Touchable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { userContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { setUser, handleSignIn, authError, setAuthError } = useContext(userContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // combine our local error with the authError
  const errorMessage = localError || authError

  // clear errors on mount
  // otherwise we get an initial error
  useEffect(() => {
    setLocalError('');
    setAuthError(null);

    // clear errors when component unmounts
    return () => {
      setAuthError(null);
    };
  }, []);  // Empty dependency array means this runs once on mount

  // clear the local error when the authError changes
  useEffect(() => {
    if (authError) {
      setLocalError('')
    }
  }, [authError])

  const validateEmail = (email) => (email.toLowerCase().endsWith('@uw.edu'))

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setForgotPasswordSent(false)
      setLocalError('')
      if (!validateEmail(email)) {
        setLocalError('Log in with your @uw.edu email!')
        return
      }

      await handleSignIn(email, password)
    } catch (error) {
      console.log('login', error)
      setLocalError(authError)
    } finally {
      setIsLoading(false)
    }
  };

  // const handleLogin = async () => {
  //   try {
  //     setIsLoading(true)
  //     setForgotPasswordSent(false)
  //     const auth = getAuth();
  //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //     setUser(userCredential.user);
  //   } catch (error) {
  //     if (email.indexOf('uw.edu') < 0) {
  //       setErrorMessage('Log in with your @uw.edu email!')
  //     } else {
  //       setErrorMessage('Incorrect email or password!')
  //     }
  //     // setErrorMessage('Incorrect email or password!')
  //     // setErrorMessage(error.message);
  //   } finally {
  //     setIsLoading(false)
  //   }
  // };

  const handleForgotPassword = async () => {
    try {
      setIsLoading(true)
      setLocalError('')

      if (!email) {
        setLocalError('Enter your email!')
        return
      }

      if (!validateEmail(email)) {
        setLocalError('Use your @uw.edu email!')
        return
      }

      await sendPasswordResetEmail(auth, email)
      setForgotPasswordSent(true)
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setLocalError('Invalid email!');
      } else {
        setLocalError('Oops! Unexpected error, please try again later');
      }
    } finally {
      setIsLoading(false)
    }
  };

  const toggle = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.upperText}>
        Welcome back!
      </Text>

      <View style={{ height: 30, }}>
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>


      <View style={styles.lowerContainer}>
        <View style={{ width: '100%' }}>
          <Text style={styles.inputHeader}>
            UW email
          </Text>
          <TextInput
            placeholder='Email'
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setLocalError('')
            }}
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
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setLocalError('')
            }}
            secureTextEntry={secureTextEntry}
          />
          <TouchableOpacity onPress={toggle}
            style={{
              width: 40, height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 2,
              top: 28
            }}>
            {secureTextEntry ? (<Ionicons name='eye-off' size={24} color={'black'} />) : (<Ionicons name='eye' size={24} color={'black'} />)}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={!email || !(password.length >= 6)}
        hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
        style={[styles.button, { backgroundColor: !email || !(password.length >= 6) ? colors.loginGray : colors.loginBlue }]}
      >
        {isLoading ? (<ActivityIndicator />) : (<Text style={styles.buttonText}>
          Log in
        </Text>)}
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => navigation.navigate('EmailOnboarding')}
        hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Sign up
        </Text>
      </TouchableOpacity> */}

      <TouchableOpacity
      >
        {forgotPasswordSent ? (
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={[styles.link, { color: 'black' }]}>
              Reset password link sent. Check your email!
            </Text>
            <Text style={[styles.link, { color: 'black' }]}>
              Didn't get it?
              <Text style={styles.link}
                onPress={handleForgotPassword}

              >
                {' Send again'}
              </Text>
            </Text>

          </View>
        ) : (<Text style={styles.link}
          onPress={handleForgotPassword}>
          Forgot password?
        </Text>)}
      </TouchableOpacity>

    </View >
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.mediumGray,
    borderRadius: 12,
    width: '100%',
    height: 35,
    paddingHorizontal: 12,
    // shadow
    // shadowColor: 'rgba(0, 0, 0, 0.25)',
    // shadowOffset: { width: 5, height: 5 },
    // shadowOpacity: 0.5,
    // shadowRadius: 10,
    // elevation: 5,
  },
  error: {
    color: 'red',
    fontFamily: 'inter',
  },
  link: {
    color: colors.loginBlue,
    marginTop: 15,
    textAlign: 'center',
    marginLeft: 15,
    textDecorationLine: 'underline'
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
    fontFamily: 'Rubik',
    color: colors.black
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
    fontFamily: 'inter',
    color: colors.loginBlue
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'gray',
    width: '100%',
    height: 40, display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginTop: 20
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'inter',
    color: 'white',
    fontWeight: '400',
  },
});

export default Login;
