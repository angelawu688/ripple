import { PencilSimple, UploadSimple } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import LoadingSpinner from "../LoadingSpinner";
import { colors } from "../../constants/colors";

export function ProfilePhotoPicker({
    currentImage, onImagePicked, disabled = false, containerStyle = {}
}) {
    const [isLoading, setIsLoading] = useState(false)

    const handlePickImage = async () => {
        try {
            setIsLoading(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }

            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false,
                quality: 0.7,
                selectionLimit: 1
            });

            if (!result.canceled) {
                const selectedUri = result?.assets?.[0]?.uri;
                onImagePicked?.(selectedUri) // just make sure it exists before we call it
            }
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <TouchableOpacity
            disabled={isLoading || disabled}
            onPress={handlePickImage}
            style={[styles.container, containerStyle]}
        >
            {isLoading && <LoadingSpinner />}

            {!isLoading && (currentImage ? (
                <View style={styles.pfpContainer}>
                    <Image
                        source={{ uri: currentImage }}
                        style={styles.pfp}

                    />
                    <Text style={styles.text}>
                        Edit photo
                    </Text>
                </View>
            ) : (
                <UploadSimple size={32} />
            ))}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        // width: '100%',
        // marginHorizontal: '20%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderColor: colors.accentGray,
    },
    pfp: {
        width: 40,
        height: 40,
        borderRadius: 50,
        marginBottom: 4,
        backgroundColor: colors.loginGray
    },
    text: {
        fontFamily: 'inter',
        fontSize: 12,
        color: colors.accentGray
    },
    pfpContainer: {
        display: 'flex',
        flexDirection: 'colum',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    }
})