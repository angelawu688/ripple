import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { colors } from "../../../colors";




const screenWidth = Dimensions.get('window').width;
const imageSize = 0.16 * screenWidth;

// renders the image preview
const ImagePreview = ({ uri, removePhoto }) => {
    return (
        <View style={{
            marginRight: 10,
            marginTop: -16 // this is a little jank but it works
        }}>
            <TouchableOpacity
                style={{
                    top: imageSize * 0.22,
                    right: -imageSize + imageSize * 0.22,
                    zIndex: 1
                }}
                onPress={() => removePhoto(uri)}>
                <Ionicons name="remove-circle" size={24} color='black' />
            </TouchableOpacity>

            <Image source={{ uri }} style={{
                width: imageSize, height: imageSize, borderRadius: 8, borderWidth: 1, borderColor: 'lightgray'
            }} />
        </View>
    )
}

// renders the little card for the tag
const TagPreview = ({ tag, removeTag }) => {
    console.log('tag', tag)
    return (
        <View style={[{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 6, paddingHorizontal: 8, borderRadius: 12, marginRight: 8,
            alignSelf: 'flex-start',
        }, styles.shadow]}>
            <Text style={{ fontFamily: 'inter', fontSize: 12, marginLeft: 2, color: '#7E7E7E' }}>
                {tag}
            </Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close-outline" size={24} />
            </TouchableOpacity>
        </View>
    )
}


const CreateListing = ({ navigation }) => {
    // TODO 
    // make keyboard friendly
    // accept photo input
    // re-navigate

    const [photos, setPhotos] = useState([]) // array of photos
    const [tags, setTags] = useState([]) // array of tags
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(0)
    const [description, setDescription] = useState('')
    const [tagInput, setTagInput] = useState('')

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPhotoPicker, setIsLoadingPhotoPicker] = useState(false)
    const [imageErrorMessage, setImageErrorMessage] = useState('')

    const handleAddTag = async (newTag) => {
        if (newTag.length <= 15) {
            setTags([...tags, newTag])
            setTagInput('')
        }
    }

    const removeTag = async (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
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
                setPhotos([...photos, ...selectedImages.map(img => img.uri)]);
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

    const removePhoto = (uri) => {
        setPhotos(photos.filter(photoURI => photoURI !== uri));
        // no backend update needed
    };

    const handlePriceChange = (text) => {
        const formattedPrice = formatPrice(text);
        setPrice(formattedPrice);
        setErrorMessage('')
        setImageErrorMessage('')
    }

    const formatPrice = (input) => {
        const cleanedPrice = input.replace(/[^0-9]/g, ''); // only allow numbers
        const number = parseInt(cleanedPrice, 10);
        if (isNaN(number)) {
            return '' // reset if we get NAN
        }

        return number.toLocaleString() // method to format with commas and such
    }

    const handlePublish = async () => {
        console.log(photos, title, price, description, tags)

        if (!title) {
            setErrorMessage('Enter a title!')
            return
        }
        if (title.length > 100) {
            setErrorMessage('Enter a shorter title!')
            return
        }

        if (!price) {
            setErrorMessage('Enter a price!')
            return
        }
        // if price is invalid

        if (description.length > 150) {
            setErrorMessage('Description length must be under 150 characters!')
            return
        }

        // this should not happen
        if (tags.length > 3 || photos.length > 5) {
            setErrorMessage('Too many tags or photos!')
            return;
        }
        // allow empty description
        // allow empty photos?

        setIsLoading(true)
        try {
            // TODO submission to DB! 
            const db = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;
            const listingData = {
                title,
                price,
                description,
                tags,
                photos,
                userId: user.uid,
                createdAt: new Date()
            }
            const docRef = await addDoc(collection(db, "listings"), listingData);
            setTimeout(() => {
                // just chill for a sec, simulating loading
                // using navigation reset so that we dont get a back buttons
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Marketplace' }],
                });
            }, [2500])
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <View
                style={styles.container}
            >



                <View style={styles.inputContainer}>
                    <Text style={styles.footerText}>
                        Title
                    </Text>
                    <TextInput
                        style={[styles.shadow, styles.middleInput]}
                        placeholder="Title"
                        placeholderTextColor="#7E7E7E"
                        value={title}
                        onChangeText={(text) => {
                            setTitle(text)
                            setErrorMessage('')
                            setImageErrorMessage('')
                        }}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.footerText}>
                            Photos | {photos.length}/5
                        </Text>
                        <Text style={{ color: colors.errorMessage }}>
                            {imageErrorMessage}
                        </Text>
                    </View>

                    {/* empty photos */}
                    {photos.length === 0 && <TouchableOpacity
                        onPress={handleAddPhoto}
                        style={[styles.shadow, styles.addPhotosContainer]}
                    >
                        <View style={{ display: 'flex', flexDirection: 'row', }}>
                            {isLoadingPhotoPicker ? <ActivityIndicator /> : <Ionicons name="add-circle-outline" size={24} color='#7E7E7E' />}

                            <Text style={[styles.placeholderText, { marginLeft: 4 }]}>
                                Add photos
                            </Text>
                        </View>

                    </TouchableOpacity>}


                    {photos.length >= 1 && <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        {photos.map((uri, index) => {
                            return (
                                <ImagePreview key={index} uri={uri} removePhoto={removePhoto} />

                            )
                        })}

                        {photos.length !== 5 && <TouchableOpacity
                            onPress={handleAddPhoto}
                            style={{ width: imageSize, height: imageSize, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 7, }}
                            hitSlop={16}
                        >
                            {isLoadingPhotoPicker ? <ActivityIndicator /> : <Ionicons name="add-circle-outline" size={20} color='#7E7E7E' />}
                        </TouchableOpacity>}

                    </View>}

                </View>



                <View style={[styles.inputContainer]}>
                    <Text style={styles.footerText}>
                        Price
                    </Text>
                    <TextInput
                        style={[styles.shadow, styles.middleInput]}
                        placeholder="0.00"
                        placeholderTextColor="#7E7E7E"
                        value={price}
                        onChangeText={handlePriceChange}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.footerText}>
                        Tags | {tags.length}/3
                    </Text>
                    {/* TODO change this to be more representative of what we want to do */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                        {tags.length < 3 && <TextInput
                            style={[styles.shadow, styles.tagInput]}
                            placeholder="Clothing"
                            placeholderTextColor="#7E7E7E"
                            value={tagInput}
                            onChangeText={(text) => {
                                console.log(tagInput)
                                setTagInput(text)
                                setErrorMessage('')
                                setImageErrorMessage('')
                            }}
                        />}
                        {tags.length < 3 && <TouchableOpacity
                            onPress={() => handleAddTag(tagInput)}
                            style={{ marginLeft: 10 }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color='#7E7E7E' />
                        </TouchableOpacity>}
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
                        {tags.map((tag, index) => {
                            return (
                                <TagPreview key={index} tag={tag} removeTag={removeTag} />
                            )
                        })}
                    </View>



                    {/* capping the legnth of tags at 15 characters */}
                    <Text style={[styles.footerText, { marginBottom: 0, color: '#7E7E7E' }, tagInput.length > 15 && { color: 'red' }]}>
                        {tagInput.length}/15 characters
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.footerText}>
                        Description
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
                        }}
                        multiline={true}
                    />
                    <Text style={[styles.footerText, { marginBottom: 0, color: '#7E7E7E' }, description.length > 150 && { color: 'red' }]}>
                        {description.length}/150 characters
                    </Text>
                </View>

                <View style={styles.errorContainer}>
                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                </View>

                <TouchableOpacity
                    onPress={() => handlePublish()}
                    style={[styles.publishButton, styles.shadow, errorMessage && { borderWidth: 1, borderColor: 'red' }, title && price && photos.length > 0 && styles.publishButtonReady]}
                >

                    {!isLoading ? <Text style={[title && price && photos.length > 0 ? { fontSize: 20, color: 'white', fontFamily: 'inter', } : styles.placeholderText, { fontWeight: '600' }]}
                    >
                        Publish
                    </Text> : <ActivityIndicator color='white' />}
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default CreateListing;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignSelf: 'center',
        width: '92%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 0
    },
    shadow: {
        shadowColor: "#0C6E86",
        shadowOffset: {
            top: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 8,
    },
    addPhotosContainer: {
        backgroundColor: 'white',
        height: imageSize,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,

        marginTop: 1
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
        color: '#1f1f1f',
        fontFamily: 'inter',
        alignSelf: 'flex-start',
        marginLeft: 12,
        marginBottom: 6,
        marginTop: 4
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
        marginBottom: 12,
        width: '100%'
    },
    tagInput: {
        width: '50%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
    },

})