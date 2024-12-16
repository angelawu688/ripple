import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { db } from '../../firebaseConfig';


export async function registerForPushNotificationsAsync(userID) {
    let token;
    // ensure th
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus;

        // if they havent granted permissions, request them
        // note: might be annoying for the user if we do this every time
        // TODO: store some flag that they dont want notifications
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status;
        }

        // if they have granted, grab their token
        if (finalStatus === 'granted') {
            token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@phunt22/uw-marketplace' }))
            console.log('Expo push token: ', token)

            // store the token under the firestore doc
            const userRef = doc(db, 'users', userID)
            await updateDoc(userRef, { expoPushToken: token })
        } else {
            // this should only happen if they decline the request
            Alert.alert('failed to get push token for notification')
        }
    } else {
        Alert.alert('Dont do this on a simulator')
    }
    return token;


    // NEED TO HANDLE ANDROID
    // todo update app.json
    // if (Platform.OS === 'android') {
    //     await Notifications.setNotificationChannelAsync('default', {
    //         name: 'default',
    //         importance: Notification.AndreoidImportance.DEFAULT,
    //         vibrationPattern: [0, 250, 250, 250],
    //         lightColor: "#FF231F7C", // idk about this, literally not hex but was on stackoverflow
    //     })
    // }
}