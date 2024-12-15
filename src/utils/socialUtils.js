import * as Linking from 'expo-linking'

export const sendProfile = (userID) => {
    if (!userID) {
        console.log('no user ID')
        return
    }
    const profileLink = Linking.createURL(`user/${userID}`)
    const messageBody = `Follow me on Ripple!\n${profileLink}`
    const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`

    try {
        Linking.openURL(smsURL)
    } catch (e) {
        console.log(e)
        throw e
    }
    // example dev URL: exp://10.155.102.135:8081/--/user/RsYuNgUxSUTm0xdD0CMi6Yhkjc73 
    // prod urls will look different, testflight urls look different, etc.
    // we will need to use firebase dynamic URLs so that people without the app will be prompted to go download
}