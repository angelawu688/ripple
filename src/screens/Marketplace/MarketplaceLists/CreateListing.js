import { useContext, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Pressable, } from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { colors } from "../../../constants/colors";
import { userContext } from "../../../context/UserContext";
import { ArrowBendRightUp, MinusCircle, PlusCircle, Scroll, UploadSimple } from "phosphor-react-native";
import CurrencyInput from 'react-native-currency-input'
import Asterisk from "../../../components/Asterisk";
import { uploadListingImage } from "../../../utils/firebaseUtils";
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { ImagePreview, TagPreview, uploadNewPhotos, validateListing } from "../../../utils/createEdit";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import { generateKeywords } from "../../../utils/search";
import LoadingSpinner from '../../../components/LoadingSpinner'
import { ToastContext } from "../../../context/ToastContext";

const screenWidth = Dimensions.get('window').width;
const imageSize = 0.16 * screenWidth;

const CreateListing = ({ navigation }) => {
    const [photos, setPhotos] = useState([]) // array of photo uris
    const [tags, setTags] = useState([]) // array of tags
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(undefined)
    const [description, setDescription] = useState('')
    const [tagInput, setTagInput] = useState('')

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPhotoPicker, setIsLoadingPhotoPicker] = useState(false)
    const [imageErrorMessage, setImageErrorMessage] = useState('')
    const { user, userData, setUserListings } = useContext(userContext)
    const { showToast } = useContext(ToastContext)

    // AUTO SCROLLING
    const scrollViewRef = useRef(null)
    // stores the position of input fields {inputKey: number}
    const [inputPositions, setInputPositions] = useState({})

    // basically adds the position of the chosen input field to our state
    const handleLayout = (key) => (event) => {
        const { y } = event.nativeEvent.layout
        setInputPositions((prev) => ({ ...prev, [key]: y }))
    }

    const scrollToInput = (key) => {
        // ensure that our refs are defined
        if (scrollViewRef.current && inputPositions[key] !== undefined) {
            const offset = 100; // tune this
            scrollViewRef.current.scrollTo({
                y: inputPositions[key] - offset,
                animated: true // pretty :)
            })


        }
    }
    // END AUTO SCROLLING

    const handleAddTag = async (newTag) => {
        if (newTag.trim().length === 0) {
            return;
        }
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
                }));
                setPhotos([...photos, ...selectedImages.map(img => img.uri)]);
                setIsLoadingPhotoPicker(false)
            } else {
                // user cancelled
                setIsLoadingPhotoPicker(false)
            }
        } catch (e) {
            console.error(e);
            setImageErrorMessage('Failed to read  image')
            setIsLoadingPhotoPicker(false)
        } finally {

            setIsLoadingPhotoPicker(false)
        }
    };

    const removePhoto = (uri) => {
        setPhotos(photos.filter(photoURI => photoURI !== uri));
        // no backend update needed, havent been uploaded yet
    };

    const handleCreatePost = async () => {
        if (!validateListing(title, price, description, tags, photos, setErrorMessage)) { return }
        setIsLoading(true)
        try {
            const db = getFirestore();

            // 1. make a doc ref w id (w/o setting data)
            const listingsCollectionRef = collection(db, "listings");
            const newListingRef = doc(listingsCollectionRef); // this makes an ID
            const listingID = newListingRef.id;

            // upload all the images
            const downloadURLS = await uploadNewPhotos(photos, user.uid, listingID, setErrorMessage)

            // generate the keywords for search
            const keywords = generateKeywords(title, tags)

            // 3. prepare data listing
            const listingData = {
                title,
                titleLowerCase: title.toLowerCase(),
                price,
                description,
                tags,
                keywords: keywords,
                photos: downloadURLS, // now each one is {thumbnail, card, full}
                userId: user.uid,
                userName: userData.name,
                userEmail: userData.email,
                userPfp: userData.pfp,
                sold: false,
                createdAt: new Date()
            }

            // 4. backend udpate
            await setDoc(newListingRef, listingData)

            // append to the users listing
            setUserListings((prevUserListings) => [...prevUserListings, { ...listingData, id: listingID }]);


            // 6. post completed message
            navigation.goBack()
            showToast('Listing uploaded!')
        } catch (e) {
            setErrorMessage(e.message)
            console.error(e);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }}
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            enabled
            keyboardVerticalOffset={100}
        >
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled" // this allows the children to have behavior on touch
            >
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
                        {photos.length >= 1 && <View style={{ display: 'flex', flexDirection: 'row', width: '100%', height: 66 }}>
                            {photos.map((uri, index) => {
                                return (
                                    <ImagePreview key={index} uri={uri} imageSize={imageSize} removePhoto={removePhoto} />
                                )
                            })}

                            {photos.length !== 5 && <TouchableOpacity
                                onPress={() => handleAddPhoto()}
                                style={{ width: imageSize, height: imageSize, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 7, zIndex: 999 }}
                                hitSlop={16}
                            >
                                {isLoadingPhotoPicker ? <ActivityIndicator /> : <PlusCircle size={30} color={colors.loginBlue} />}
                            </TouchableOpacity>}
                        </View>}



                        <View
                            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                            <Text style={styles.footerText}>
                                Photos | {photos.length}/5
                            </Text>
                            <Text style={{ color: colors.errorMessage }}>
                                {imageErrorMessage}
                            </Text>
                        </View>

                    </View>

                    {/* title */}
                    <View onLayout={handleLayout('title')}
                        style={styles.inputContainer}
                    >
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
                                setImageErrorMessage('')
                            }}
                            onFocus={() => scrollToInput('title')}
                            maxLength={60}
                            enterKeyHint='Enter'
                        />
                    </View>

                    <View onLayout={handleLayout('price')}
                        style={[styles.inputContainer]}
                    >
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
                                setImageErrorMessage('')
                            }}
                            delimiter=","
                            separator="." // otherwise they use ,
                            precision={2}
                            minValue={0}
                            prefix='$'
                            placeholder="$1.63"
                            placeholderTextColor="#7E7E7E"
                            onFocus={() => scrollToInput('price')}
                        />
                    </View>


                    {/* Tags input container */}
                    <View onLayout={handleLayout('tags')}
                        style={styles.inputContainer}
                    >
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
                                    setErrorMessage('')
                                    setImageErrorMessage('')
                                }}
                                onFocus={() => scrollToInput('tags')}
                            />}
                            {tags.length < 3 && (
                                <TouchableOpacity
                                    disabled={tagInput.trim().length === 0 || tagInput.trim().length > 15}
                                    onPressIn={() => {
                                        handleAddTag(tagInput)
                                    }}
                                    style={{
                                        marginLeft: 10,
                                        // backgroundColor: tagInput.length > 0 ? colors.loginBlue : colors.loginGray
                                    }}
                                >
                                    {/* <ArrowBendRightUp color={'white'} size={20} /> */}
                                    {tagInput.length > 0 ? (
                                        <PlusCircle color={colors.loginBlue} size={36} weight="fill" />
                                        // <ArrowBendRightUp size={20} color={colors.loginBlue} />
                                    ) : (
                                        <PlusCircle color={colors.accentGray} size={36} />
                                        // <ArrowBendRightUp size={20} color={colors.loginGray} />
                                    )}
                                </TouchableOpacity>
                            )}
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

                    <View onLayout={handleLayout('description')}
                        style={styles.inputContainer}
                    >
                        <Text style={styles.titleText}>
                            Description
                            {/* <Asterisk /> */}
                            {/*not required, no asterisk  */}
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
                            onFocus={() => scrollToInput('description')}
                            multiline={true}
                        />
                        <Text style={[styles.footerText, { marginBottom: 0, color: '#7E7E7E' }, description.length > 163 && { color: 'red' }]}>
                            {description.length}/163 characters
                        </Text>
                    </View>

                    {/* error publish container */}
                    <View style={{ width: '100%', marginTop: tags.length > 0 ? -32 : 0 }}>
                        <View style={styles.errorContainer}>
                            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                        </View>

                        <TouchableOpacity
                            onPress={(e) => {
                                handleCreatePost()
                            }}
                            style={[
                                styles.publishButton,
                                errorMessage && { borderWidth: 1, borderColor: 'red' },
                                title && price >= 0 && photos.length > 0 && styles.publishButtonReady]}
                        >

                            {!isLoading ? <Text style={[title && price >= 0 && photos.length > 0 ? { fontSize: 20, color: 'white', fontFamily: 'inter', } : styles.placeholderText, { fontWeight: '600' }]}
                            >
                                Publish
                            </Text> : <LoadingSpinner />}
                        </TouchableOpacity>
                    </View>


                </View>
                {/* </Pressable> */}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default CreateListing;

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
        paddingVertical: 0
    },
    titleText: {
        fontSize: 18,
        fontFamily: 'inter',
        color: colors.loginBlue,
        marginBottom: 6,
        marginLeft: 6
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
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
        color: colors.accentGray,
        fontFamily: 'inter',
        fontSize: 20,
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
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.accentGray
    },
    publishButtonReady: {
        backgroundColor: colors.loginBlue,
        borderWidth: 0,
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
    // scrollContent: {
    //     justifyContent: 'flex-start',
    //     alignItems: 'center',
    // },
    inputContainer: {
        marginBottom: 20,
        width: '100%'
    },
    tagInput: {
        // width: '50%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
        flex: 1
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