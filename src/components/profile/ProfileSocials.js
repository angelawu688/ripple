import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { useSocialMedia } from '../../hooks/useSocialMedia';
import LoadingSpinner from '../LoadingSpinner';
import { colors } from '../../constants/colors';

const ProfileSocials = ({ userProfile }) => {
    const { loadingIG, loadingLI, openSocial } = useSocialMedia(userProfile);

    // only show if the user has them
    if (!userProfile?.instagram && !userProfile?.linkedin) {
        return null;
    }

    return (
        <View style={styles.socialsContainer}>
            {/* instagram Button */}
            {userProfile.instagram && (
                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => openSocial('instagram')}
                >
                    {loadingIG ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <Image
                                source={require('../../../assets/images/IG_logo.png')}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialText}>
                                {userProfile.instagram}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            {/* linkedin Button */}
            {userProfile.linkedin && (
                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => openSocial('linkedin')}
                >
                    {loadingLI ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <Image
                                source={require('../../../assets/images/LI_logo.png')}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialText} numberOfLines={1}>
                                {userProfile.linkedin}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    socialsContainer: {
        flexDirection: 'column',
        marginTop: 16,
        width: '100%',
        gap: 12
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingVertical: 8,
    },
    socialIcon: {
        width: 25,
        height: 25,
        borderRadius: 5,
    },
    socialText: {
        marginLeft: 8,
        fontSize: 17,
        fontFamily: 'inter',
        color: colors.loginBlue,
        maxWidth: '80%',
    },
});

export default ProfileSocials;