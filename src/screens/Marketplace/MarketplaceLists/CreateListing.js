import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';



const CreateListing = ({ navigation }) => {
    // TODO 
    // make keyboard friendly
    // accept photo input
    // re-navigate

    const [photos, setPhotos] = useState([]) // array of photos
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(0)
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')

    const [errorMessage, setErrorMessage] = useState('')

    const handlePublish = () => {
        console.log(photos, title, price, description, category)

        if (!title) {
            setErrorMessage('Enter a title!')
            return
        }
        if (!price) {
            setErrorMessage('Enter a price!')
            return
        }
        if (description.length > 150) {
            setErrorMessage('Description length must be under 150 characters!')
            return
        }
        // allow empty description
        // allow empty photos?

        try {
            // submission to DB and 
            // navigate back to home
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View
            style={styles.container}
        >
            <View style={[styles.shadow, styles.addPhotosContainer]}>
                <Text style={styles.placeholderText}>
                    Add photos (placeholder)</Text>
            </View>
            <Text style={styles.footerText}>
                Photos 0/5
            </Text>

            <View style={styles.middleInputContainer}>
                <TextInput
                    style={[styles.shadow, styles.middleInput]}
                    placeholder="Title"
                    placeholderTextColor="#7E7E7E"
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.shadow, styles.middleInput]}
                    placeholder="Price"
                    placeholderTextColor="#7E7E7E"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                />

                <TextInput
                    style={[styles.shadow, styles.middleInput]}
                    placeholder="Category"
                    placeholderTextColor="#7E7E7E"
                    value={category}
                    onChangeText={setCategory}
                />

                <TextInput
                    style={[styles.shadow, styles.descriptionInput]}
                    placeholder="Description"
                    placeholderTextColor="#7E7E7E"
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                />
            </View>

            <Text style={[styles.footerText, { marginBottom: 0 }, description.length > 150 && { color: 'red' }]}>
                {description.length}/150 characters
            </Text>

            <View style={styles.errorContainer}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>

            <TouchableOpacity
                onPress={() => handlePublish()}
                style={[styles.publishButton, styles.shadow, errorMessage && { borderWidth: 1, borderColor: 'red' }]}
            >

                <Text style={styles.placeholderText}>
                    Publish
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default CreateListing;


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignSelf: 'center',
        width: '92%',
        height: '50%',
        justifyContent: 'flex-start',
        alignItems: 'center',

    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 8,
    },
    addPhotosContainer: {
        backgroundColor: 'white',
        height: 128,
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
        height: 128,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 12,
    },
    footerText: {
        fontSize: 14,
        color: '#7E7E7E',
        fontFamily: 'inter',
        alignSelf: 'flex-start',
        marginLeft: 12,
        marginTop: 12,
        marginBottom: 20
    },
    publishButton: {
        width: '100%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

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
    }
})