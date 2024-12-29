import { ChatCircle, Storefront, User, Airplane } from 'phosphor-react-native';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export function MessageTabIcon({ focused, unreadCount }) {
    return (
        <View style={styles.iconContainer}>
            <ChatCircle
                size={28}
                color={colors.loginBlue}
                weight={focused ? "fill" : "regular"}
            />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </View>
    );
}

export function ProfileTabIcon({ focused, userData }) {
    if (userData?.pfp) {
        return (
            <Image
                source={{ uri: userData.pfp }}
                style={[
                    styles.profileImage,
                    { opacity: focused ? 1.0 : 0.7 }
                ]}
            />
        );
    }

    return (
        <View style={[styles.profilePlaceholder, { opacity: focused ? 1.0 : 0.7 }]}>
            <User size={20} />
        </View>
    );
}

export function MarketplaceTabIcon({ focused }) {
    return (
        <View style={styles.iconContainer}>
            <Storefront size={28} color={colors.loginBlue} weight={focused ? 'fill' : 'regular'} />
        </View>
    )
}


const styles = StyleSheet.create({
    profilePlaceholder: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        borderRadius: 50,
        backgroundColor: colors.loginGray,
    },
    profileImage: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        borderRadius: 50,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: 2,
        backgroundColor: 'red',
        borderRadius: 4,
        minWidth: 17,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
        fontFamily: 'inter',
    },
    iconContainer: {
        width: 35,
        height: 35
    },
})
