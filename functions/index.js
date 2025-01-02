const { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require('firebase-admin')
admin.initializeApp(); // gives us access to firestore & other stuff

// sends an expo notification on a new message being created in the DB
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

// helper function to send the actual expo notification
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


// delete all user info and storage when someone deletes their account
exports.onUserDeleted = onDocumentDeleted("users/{userID}", async (event) => {
    // get uid from the deleted document
    const uid = event.params.userID;
    if (!uid) {
        console.error("No user ID available in deletion trigger");
        return { success: false, error: "No user ID" };
    }

    const db = admin.firestore();
    try {
        const bucket = admin.storage().bucket();
        let batch = db.batch()
        let operationCount = 0;

        // note: firebase batch has a max of 500, so we will do this if needd
        const commitBatchIfNeeded = async () => {
            if (operationCount >= 450) {
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        };

        // delete pfp and listings photos
        await Promise.all([
            // delete pfp
            bucket.deleteFiles({
                prefix: `profile-pictures/${uid}`
            }),
            // delete anything in the listings pictures folder
            bucket.deleteFiles({
                prefix: `listing-pictures/${uid}/`
            })
        ])

        // listings
        const listingsSnapshot = await db.collection('listings')
            .where('userId', '==', uid)
            .get();

        for (const listingDoc of listingsSnapshot.docs) {
            batch.delete(listingDoc.ref);
            operationCount++;
            await commitBatchIfNeeded();
        }

        // saved posts
        const savedPostsSnapshot = await db.collection('savedPosts')
            // we know that the userID is the prefix of hte savedPost document
            .where('__name__', '>=', uid)
            .where('__name__', '<=', uid + '\uf8ff')
            .get()

        for (const doc of savedPostsSnapshot.docs) {
            batch.delete(doc.ref);
            operationCount++;
            await commitBatchIfNeeded();
        }

        // following/followers
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data()

            // remove user from other users following lists
            if (userData.followers && userData.followers.length > 0) {
                const followerUpdates = userData.followers.map(async follower => {
                    const followerRef = db.collection('users').doc(follower.follower_id);
                    const followerDoc = await followerRef.get();

                    if (followerDoc.exists) {
                        operationCount++;
                        await commitBatchIfNeeded();
                        return followerRef.update({
                            following: followerDoc.data().following.filter(
                                f => f.following_id !== uid
                            )
                        });
                    }
                });
                await Promise.all(followerUpdates);
            }

            // remove users from other users followers lists
            if (userData.following && userData.following.length > 0) {
                const followingUpdates = userData.following.map(async following => {
                    const followingRef = db.collection('users').doc(following.following_id);
                    const followingDoc = await followingRef.get();

                    if (followingDoc.exists) {
                        operationCount++;
                        await commitBatchIfNeeded();
                        return followingRef.update({
                            followers: followingDoc.data().followers.filter(
                                f => f.follower_id !== uid
                            )
                        });
                    }
                });
                await Promise.all(followingUpdates);
            }
        }

        // conversations
        // find conversations that involved the user and delete all of them
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('users', 'array-contains', uid)
            .get()

        // for each convdoc
        for (const conversationDoc of conversationsSnapshot.docs) {
            // get each message
            const messagesSnapshot = await conversationDoc.ref
                .collection('messages')
                .get()

            // delete each message
            for (const messageDoc of messagesSnapshot.docs) {
                batch.delete(messageDoc.ref);
                operationCount++;
                await commitBatchIfNeeded();
            }

            // delete the whole conv ref
            batch.delete(conversationDoc.ref)
            operationCount++;
            await commitBatchIfNeeded();

            const conversationId = conversationDoc.id
            await bucket.deleteFiles({
                prefix: `conversations/${conversationId}`
            })
        }

        await batch.commit();
        await admin.auth().deleteUser(uid);
        console.log(`Succesfully deleted user data for: ${uid}`)
        return { success: true, }
    } catch (error) {
        console.error(`Error cleaning up user data: `, error)
        return { success: false, error: error.message }
    }
})

exports.onUserInfoUpdated = onDocumentUpdated("users/{userID}", async (event) => {
    // get uid from the deleted document
    const uid = event.params.userID;
    if (!uid) {
        console.error("No user ID available in updating trigger");
        return { success: false, error: "No user ID" };
    }

    // get current and previous user data
    const data = event.data.after.data();
    const prevData = event.data.before.data();

    // only doing something if name or pfp change rn
    // we can always add more fields but basically i don't want to do this everytime someone makes another search yk
    // if we do mutuals, we can add following and follower fields to this
    if (data.name === prevData.name && data.pfp === prevData.pfp && data.major === prevData.major) {
        return null;
    }

    const db = admin.firestore();
    try {
        let batch = db.batch()
        let operationCount = 0;

        // note: firebase batch has a max of 500, so we will do this if needed
        const commitBatchIfNeeded = async () => {
            if (operationCount >= 450) {
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        };

        // listings
        const listingsSnapshot = await db.collection('listings')
            .where('userId', '==', uid)
            .get();

        for (const listingDoc of listingsSnapshot.docs) {
            batch.update(listingDoc.ref, { userPfp: data.pfp, userName: data.name });
            operationCount++;
            await commitBatchIfNeeded();
        }

        // following/followers
        // update user info in other users following lists
        if (prevData.followers && prevData.followers.length > 0) {
            const followerUpdates = prevData.followers.map(async follower => {
                const followerRef = db.collection('users').doc(follower.follower_id);
                const followerDoc = await followerRef.get();

                if (followerDoc.exists) {
                    const following = followerDoc.data().following || [];

                    // Update the follower entry with new username and profile picture
                    const updatedFollowing = following.map(following => {
                        if (following.following_id === uid) {
                            return {
                                ...following,
                                following_name: data.name,
                                following_pfp: data.pfp,
                                following_major: data.major,
                            };
                        }
                        return following;
                    });

                    operationCount++;
                    await commitBatchIfNeeded();
                    return followerRef.update({
                        following: updatedFollowing
                    });
                }
            });
            await Promise.all(followerUpdates);
        }

        // update user info in other users followers lists
        if (prevData.following && prevData.following.length > 0) {
            const followingUpdates = prevData.following.map(async following => {
                const followingRef = db.collection('users').doc(following.following_id);
                const followingDoc = await followingRef.get();

                if (followingDoc.exists) {
                    const followers = followingDoc.data().followers || [];

                    // Update the follower entry with new username and profile picture
                    const updatedFollowers = followers.map(follower => {
                        if (follower.follower_id === uid) {
                            return {
                                ...follower,
                                follower_name: data.name,
                                follower_pfp: data.pfp,
                                follower_major: data.major,
                            };
                        }
                        return follower;
                    });

                    operationCount++;
                    await commitBatchIfNeeded();
                    return followingRef.update({
                        followers: updatedFollowers
                    });
                }
            });
            await Promise.all(followingUpdates);
        }

        // conversations
        // find conversations that involved the user and update all of them
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('users', 'array-contains', uid)
            .get()

        // for each convdoc
        for (const conversationDoc of conversationsSnapshot.docs) {
            const conversationData = conversationDoc.data();
            const userDetails = conversationData.userDetails;

            //
            const userKey = Object.keys(userDetails).find(
                key => key === uid
            );

            if (userKey) {
                const updatedUserDetails = {
                    ...userDetails,
                    [userKey]: {
                        ...userDetails[userKey],
                        name: data.name, // Update the name
                        pfp: data.pfp // Update the profile picture
                    }
                };

                // Add the update to the batch
                batch.update(conversationDoc.ref, { userDetails: updatedUserDetails });
                operationCount++;
                await commitBatchIfNeeded();
            }
        }

        await batch.commit();
        console.log(`Successfully updated user data for: ${uid}`)
        return { success: true, }
    } catch (error) {
        console.error(`Error updating user data: `, error)
        return { success: false, error: error.message }
    }
})