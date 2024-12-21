/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require('firebase-admin')

admin.initializeApp(); // gives us access to firestore

exports.sendNotificationOnNewMessage = onDocumentCreated(
    "conversations/{convID}/messages/{messageID}",
    async (event) => {
        const snapshot = event.data;
        const context = event.params;
        const messageData = snapshot.data();
        const convID = context.convID;

        // get conv doc to find the users
        const convRef = admin.firestore().collection('conversations').doc(convID);
        const convSnap = await convRef.get();
        const conv = convSnap.data();

        // find ids 
        const receiverID = conv.users.find(uid => uid !== messageData.sentBy)
        const senderID = messageData.sentBy;

        // get data in parallel
        const [receiverSnap, senderSnap] = await Promise.all([
            admin.firestore().collection('users').doc(receiverID).get(),
            admin.firestore().collection('users').doc(senderID).get()
        ]);

        // get data
        const userData = receiverSnap.data();
        const senderData = senderSnap.data();
        const senderName = senderData.name

        // get their push token from their userData
        const expoPushToken = userData.expoPushToken;
        const expoPushTokenString = expoPushToken?.data;

        // const senderName = userData?.name || 'You have a new message!'
        // const expoPushTokenString = expoPushToken?.data




        // // find thier userTokn
        // const userRef = admin.firestore().collection('users').doc(receiverID)
        // const userSnap = await userRef.get()
        // const userData = userSnap.data()

        // // get their push token from their userData
        // const expoPushToken = userData.expoPushToken
        // const name = userData.name || 'You have a new message!'
        // const expoPushTokenString = expoPushToken?.data

        // data for the notification



        const title = senderName ? senderName.substring(0, 100) + (senderName.length > 50 ? "..." : '') : 'You received a message!'
        const body = messageData.textContent ? messageData.textContent.substring(0, 100) + (messageData.textContent.length > 100 ? "..." : "") : '1 attachment'

        // use Expo's push API
        if (expoPushTokenString) {
            try {
                await sendExpoNotification(expoPushTokenString, title, body, { conversationID: convID })
            } catch (e) {
                console.log(e)
            }
        } else if (expoPushToken) {
            console.log('push token but no data for user', receiverID)
            // or we have malformed data
        } else {
            // user didnt opt into push notifications
            return null
        }
    }
);

async function sendExpoNotification(expoPushToken, title, body, data) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data
        })
    })
    const result = await response.json();
    console.log('Expo Push Notification Sent', result)
}


