import { useState } from "react";
import * as Linking from 'expo-linking'
import { Alert } from "react-native";

export const useSocialMedia = (userProfile) => {
    const [loadingIG, setLoadingIG] = useState(false);
    const [loadingLI, setLoadingLI] = useState(false);

    const openSocial = async (social) => {
        if (!userProfile) {
            return;
        }
        let url = ''
        switch (social) {

            case ('instagram'):
                if (!userProfile.instagram) {
                    setLoadingIG(true)
                    Alert.alert('Error', 'No Instagram user found')
                    return;
                }
                // works for now
                url = `https://www.instagram.com/${userProfile.instagram.split('@')[1]}`;
                break;
            case ('linkedin'):
                const isUrl = /^https?:\/\/.+$/.test(userProfile.linkedin);
                if (!isUrl) {
                    Alert.alert('Error', 'Invalid URL')
                    return;
                }
                if (!userProfile.linkedin) {
                    Alert.alert('Error', 'No LinkedIn user found')
                    return;
                }
                setLoadingLI(true)
                url = userProfile.linkedin
                console.table(url)
                break;
            default:
                Alert.alert('Error', 'Unsupported platform');
                return;
        }
        try {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                await Linking.openURL(url)
            } else {
                Alert.alert('Error', "Can't open Instagram profile")
            }
        } catch (e) {
            console.error("An error occurred while trying to open Instagram:", error);
            Alert.alert("Error", "An unexpected error occurred.");
            throw e
        } finally {
            setLoadingIG(false)
            setLoadingLI(false)
        }
    };

    return {
        loadingIG,
        loadingLI,
        openSocial
    };
};