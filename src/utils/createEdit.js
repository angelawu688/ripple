import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { uploadListingImage } from "./firebaseUtils";
import { MinusCircle } from "phosphor-react-native";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";


// common validation function
// returns false if not valid, returns true if valid
export const validateListing = (title, price, description, tags, photos, setErrorMessage) => {
    if (!title) {
        setErrorMessage('Enter a title!')
        return false
    }

    if (title.length > 100) {
        setErrorMessage('Enter a shorter title!')
        return false
    }

    // price field validation is largely handled by our actual input field
    // if issues arise, this is where to fix them, but for now just need to check for undefined
    if (!price) {
        setErrorMessage('Enter a price!')
        return false
    }

    if (description.length > 163) {
        setErrorMessage('Description length must be under 163 characters!')
        return false
    }

    // this should not happen
    if (tags.length > 3 || photos.length > 5) {
        setErrorMessage('Too many tags or photos!')
        return false
    }
    // allow empty description
    if (photos.length === 0) {
        setErrorMessage('Enter photo(s)!')
        return false
    }
    // allow empty description
    return true
}

// function to upload new photos to the DB
export const uploadNewPhotos = async (photos, userId, listingID, setErrorMessage) => {
    const uploadPromises = photos.map(async (uri, index) => {
        try {
            const imageUrls = await uploadListingImage(uri, userId, listingID, index);
            return imageUrls; // will be an object like { thumbnail: url, card: url, full: url }
        } catch (e) {
            setErrorMessage(e?.message ? e.message : 'Image upload failed')
            throw e; // Important to throw so Promise.all fails if any upload fails
        }
    });
    return await Promise.all(uploadPromises);
};


// renders the image preview
export const ImagePreview = ({ uri, removePhoto, imageSize }) => {
    const imageUri = typeof uri === 'object' ? uri.card : uri;

    return (
        <View style={{
            marginRight: 10,
            marginTop: -16 // this is a little jank but it works
        }}>
            <TouchableOpacity
                style={{
                    top: imageSize * 0.25,
                    right: -imageSize + imageSize * 0.25,
                    zIndex: 1
                }}
                onPress={() => removePhoto(uri)}>
                <MinusCircle weight="fill" color={colors.loginBlue} size={30} />
            </TouchableOpacity>
            <Image source={{ uri: imageUri }} style={{
                width: imageSize, height: imageSize, borderRadius: 8, borderWidth: 1, borderColor: 'lightgray'
            }} />
        </View>
    )
}

// renders the little card for the tag
export const TagPreview = ({ tag, removeTag }) => {
    return (
        <View style={[{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginRight: 8,
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

const styles = StyleSheet.create({
    shadow: {
        shadowColor: colors.accentGray,
        shadowOffset: {
            top: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 8,
    },
})