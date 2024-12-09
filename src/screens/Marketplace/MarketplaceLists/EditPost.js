import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getFirestore, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { colors } from "../../../colors";
import { userContext } from "../../../context/UserContext";
import { MinusCircle, PlusCircle, UploadSimple } from "phosphor-react-native";
import CurrencyInput from 'react-native-currency-input'
import { uploadListingImage, deleteImageFromDB } from "../../../utils/firebaseUtils";
import { ImagePreview, TagPreview, uploadNewPhotos, validateListing } from "../../../utils/createEdit";
import { GeneratedIdentifierFlags } from "typescript";
import { generateKeywords } from "../../../utils/search";


const screenWidth = Dimensions.get('window').width;
const imageSize = 0.16 * screenWidth;

const EditListing = ({ navigation, route }) => {
    const { listing, listingID } = route.params
    const { user, userData, setUserListings } = useContext(userContext);

    // all of these are grabbed from the route params, not a database read. Also is immediate
    // cheaper, but if we are having issues with initialaztion that might be why
    const [photos, setPhotos] = useState(listing.photos || []) // array of photos
    const [tags, setTags] = useState(listing.tags || []) // array of tags
    const [title, setTitle] = useState(listing.title || '')
    const [price, setPrice] = useState(listing.price || 0)
    const [description, setDescription] = useState(listing.description || '')
    const [tagInput, setTagInput] = useState('')
    const originalPhotos = listing?.photos // track to compare final in order to delete


    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPhotoPicker, setIsLoadingPhotoPicker] = useState(false)
    const [imageErrorMessage, setImageErrorMessage] = useState('')
    const [changes, setChanges] = useState(false)


    const handleAddTag = async (newTag) => {
        if (newTag.length <= 15) {
            setTags([...tags, newTag])
            setTagInput('')
            setChanges(true)
        }
    }

    const removeTag = async (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
        setChanges(true)
    }

    // this will use the expo photo picker library to pick a photo from the user
    // we have the permissions in our plist file (under app.json)
    // we also prompt permissions from them :)
    const handleAddPhoto = async () => {
        setImageErrorMessage('')
        try {
            setIsLoadingPhotoPicker(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }
            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated line
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: Math.max(0, 5 - photos.length), // prevent negatives
            });

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                }));

                // frontend changes
                setPhotos([...photos, ...selectedImages.map(img => img.uri)]);
                setChanges(true)
                setIsLoadingPhotoPicker(false)
            } else {
                // user cancelled
                setIsLoadingPhotoPicker(false)
            }
        } catch (e) {
            console.log(e);
            setImageErrorMessage('Failed to read  image')
            setIsLoadingPhotoPicker(false)
        } finally {

            setIsLoadingPhotoPicker(false)
        }
    };

    // removes a photo from the DB then updates the UI
    const removePhoto = async (uri) => {
        try {
            setErrorMessage('')
            // do we need loading state?
            const fileName = uri.split('/').pop().split('?')[0]; // Extract file name from URI
            const photoRef = decodeURIComponent(`${fileName}`);
            await deleteImageFromDB(photoRef);

            // update UI after successful image deletion
            setPhotos(photos.filter(photoURI => photoURI !== uri));
            setChanges(true)
        } catch (e) {
            if (e.code === 'storage/object-not-found') {
                // update frontend regardless
                setPhotos(photos.filter(photoURI => photoURI !== uri));
                setChanges(true);

            } else {
                console.log('Error deleting photo:', e);
                setErrorMessage('Failed to delete photo. Please try again.');
            }

        } finally {
            // set some loading state to false?
        }

    };

    const handleSaveChanges = async () => {
        if (!validateListing(title, price, description, tags, photos, setErrorMessage)) return;
        setIsLoading(true)
        try {
            const db = getFirestore();
            // figure out which ones of the photos are new
            const newPhotos = photos.filter((photo) => !originalPhotos.includes(photo))

            // figure out which ones are deleted/missing
            const removedPhotos = originalPhotos.filter((photo) => !photos.includes(photo));

            // upload new ones to storage
            // by using Date.now() in upload, we avoid potential issues with overwrites
            const uploadPromises = newPhotos.map(async (uri, index) => {
                return await uploadListingImage(uri, user.uid, listingID, index);
            });
            const newPhotoURLs = await Promise.all(uploadPromises);

            // prepare photos (old + new photos)
            const finalPhotoURLs = [
                ...originalPhotos.filter((photo) => !removedPhotos.includes(photo)),
                ...newPhotoURLs,
            ];

            const keywords = generateKeywords(title, tags)

            const listingData = {
                title,
                titleLowerCase: title.toLowerCase(),
                price,
                description,
                tags,
                keywords: keywords,
                photos: finalPhotoURLs,
                userId: user.uid,
                userName: userData.name,
                userEmail: userData.email,
                userPfp: userData.pfp,
                sold: false, // if we are editing a post, it shouldnt be sold. Disallow editing while sold
                createdAt: listing.createdAt, // keep the og date
            };


            // frontend and backend change
            const editDoc = await updateDoc(doc(db, "listings", listingID), listingData);

            // update local state
            setUserListings(prevUserListings =>
                prevUserListings.map(listing =>
                    listing.id === listingID ? { ...listing, ...listingData } : listing
                )
            );

            navigation.goBack();
            // SOME SORT OF TOAST HERE
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e);
        } finally {
            setIsLoading(false)
        }
    }

    const Asterisk = () => {
        return (
            <Text style={{ color: colors.errorMessage }}>
                {' *'}
            </Text>
        )
    }

    return (
        // TODO make the KAV work

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <View
                style={styles.container}
            >
                {/* photos */}
                <View style={styles.inputContainer}>
                    <Text style={styles.titleText}>
                        Upload images
                        <Asterisk />
                    </Text>
                    {/* empty photos */}
                    {photos.length === 0 && <TouchableOpacity
                        onPress={handleAddPhoto}
                        style={[styles.shadow, styles.addPhotosContainer]}
                    >
                        <View style={{ display: 'flex', flexDirection: 'row', }}>
                            {isLoadingPhotoPicker ? <ActivityIndicator /> : <UploadSimple size={30} color={colors.accentGray} />}
                        </View>
                    </TouchableOpacity>}

                    {/* photo preview and + icon */}
                    {photos.length >= 1 && <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        {photos.map((uri, index) => {
                            return (
                                <ImagePreview key={index} uri={uri} imageSize={imageSize} removePhoto={removePhoto} />
                            )
                        })}

                        {photos.length !== 5 && <TouchableOpacity
                            onPress={handleAddPhoto}
                            style={{ width: imageSize, height: imageSize, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 7, }}
                            hitSlop={16}
                        >
                            {isLoadingPhotoPicker ? <ActivityIndicator /> : <PlusCircle size={30} color={colors.loginBlue} />}
                        </TouchableOpacity>}
                    </View>}

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.footerText}>
                            Photos | {photos.length}/5
                        </Text>
                        <Text style={{ color: colors.errorMessage }}>
                            {imageErrorMessage}
                        </Text>
                    </View>
                </View>

                {/* title */}
                <View style={styles.inputContainer}>
                    <Text style={styles.titleText}>
                        Title
                        <Asterisk />
                    </Text>
                    <TextInput
                        style={[styles.shadow, styles.middleInput]}
                        placeholder="Title"
                        placeholderTextColor="#7E7E7E"
                        value={title}
                        onChangeText={(text) => {
                            setTitle(text)
                            setErrorMessage('')
                            setChanges(true)
                            setImageErrorMessage('')
                        }}
                    />
                </View>

                <View style={[styles.inputContainer]}>
                    <Text style={styles.titleText}>
                        Price
                        <Asterisk />
                    </Text>
                    <CurrencyInput
                        style={[styles.shadow, styles.middleInput, { padding: 10 }]}
                        value={price}
                        onChangeValue={(text) => {
                            setPrice(text)
                            setErrorMessage('')
                            setChanges(true)
                            setImageErrorMessage('')
                        }}
                        delimiter=","
                        separator="." // otherwise they use ,
                        precision={2}
                        minValue={0}
                        prefix='$'
                        placeholder="$1.63"
                    />
                    {/* <TextInput
                        style={[styles.shadow, styles.middleInput]}
                        placeholder="0.00"
                        placeholderTextColor="#7E7E7E"
                        value={price}
                        onChangeText={handlePriceChange}
                        keyboardType="numeric"
                    /> */}
                </View>


                {/* Tags input container */}
                <View style={styles.inputContainer}>
                    <Text style={styles.titleText}>
                        Tags | {tags.length}/3
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        {tags.length < 3 && <TextInput
                            style={[styles.shadow, styles.tagInput]}
                            placeholder="Clothing"
                            placeholderTextColor="#7E7E7E"
                            value={tagInput}
                            onChangeText={(text) => {
                                setTagInput(text)
                            }}
                        />}
                        {tags.length < 3 && <TouchableOpacity
                            onPress={() => handleAddTag(tagInput)}
                            style={{ marginLeft: 10 }}
                            disabled={tagInput.length === 0}
                        >
                            <PlusCircle color={tagInput.length > 0 && tagInput.length <= 15 ? colors.loginBlue : colors.accentGray} size={30} />
                        </TouchableOpacity>}
                    </View>

                    {/* tag previews */}
                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
                        {tags.map((tag, index) => {
                            return (
                                <TagPreview key={index} tag={tag} removeTag={removeTag} />
                            )
                        })}
                    </View>

                    {/* capping the legnth of tags at 15 characters */}
                    <Text style={[styles.footerText, { marginBottom: 0, color: colors.accentGray }, tagInput.length > 15 && { color: colors.errorMessage }]}>
                        {tagInput.length}/15 characters
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.titleText}>
                        Description
                        <Asterisk />
                    </Text>
                    <TextInput
                        style={[styles.shadow, styles.descriptionInput]}
                        placeholder="Description"
                        placeholderTextColor="#7E7E7E"
                        value={description}
                        onChangeText={(text) => {
                            setDescription(text)
                            setErrorMessage('')
                            setImageErrorMessage('')
                            setChanges(true)
                        }}
                        multiline={true}
                    />
                    <Text style={[styles.footerText, { marginBottom: 0, color: '#7E7E7E' }, description.length > 163 && { color: 'red' }]}>
                        {description.length}/163 characters
                    </Text>
                </View>

                <View style={styles.errorContainer}>
                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                </View>

                <TouchableOpacity
                    onPress={() => handleSaveChanges()}
                    style={[styles.publishButton, styles.shadow, errorMessage && { borderWidth: 1, borderColor: 'red' }, changes && styles.publishButtonReady]}
                >

                    {!isLoading ? <Text style={[changes ? { fontSize: 20, color: 'white', fontFamily: 'inter', } : styles.placeholderText, { fontWeight: '600' }]}
                    >
                        Save
                    </Text> : <ActivityIndicator color='white' />}
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default EditListing;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignSelf: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 0,
        paddingHorizontal: 25,
        paddingVertical: 15
    },
    titleText: {
        fontSize: 18,
        fontFamily: 'inter',
        color: colors.loginBlue,
        marginBottom: 6,
        marginLeft: 6
    },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOffset: {
            top: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 8,
    },
    addPhotosContainer: {
        backgroundColor: 'white',
        // height: imageSize,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 1,
        height: 65,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.accentGray
    },
    placeholderText: {
        color: '#7E7E7E',
        fontFamily: 'inter',
        fontSize: 16
    },
    middleInput: {
        width: '100%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    middleInputContainer: {
        width: '100%',
        height: 280,
        justifyContent: 'space-between',
        marginTop: 20
    },
    descriptionInput: {
        width: '100%',
        height: 90,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 12,
    },
    footerText: {
        fontSize: 14,
        color: colors.accentGray,
        fontFamily: 'inter',
        alignSelf: 'flex-start',
        marginTop: 6
    },
    publishButton: {
        width: '100%',
        height: 45,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 35,
    },
    publishButtonReady: {
        backgroundColor: colors.neonBlue,
    },
    errorContainer: {
        width: '100%',
        height: 30,
        marginTop: 12,
        marginLeft: 12
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        fontFamily: 'inter'
    },
    scrollContent: {
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        width: '100%'
    },
    tagInput: {
        width: '50%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    publishShadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            top: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    }
})