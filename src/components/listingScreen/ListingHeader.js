import { StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../utils/formatDate";
import { colors } from "../../constants/colors";

export default function ListingHeader({
    title,
    price,
    // createdAt 
}) {
    return (<View style={styles.sectionContainer}>
        <View style={styles.upperTextContainer}>
            <Text numberOfLines={1}
                style={styles.title}>
                {title}
            </Text>
            <Text style={styles.price}>
                ${price}
            </Text>
        </View>
        {/* {(<Text style={styles.createdAt}>
            {formatDate(createdAt.seconds)}
        </Text>)} */}
    </View>)
}

const styles = StyleSheet.create({
    sectionContainer: {
        width: '100%',
        paddingHorizontal: 15,
        alignSelf: 'center',
        flexDirection: 'column',
        marginTop: 16
    },
    title: {
        fontFamily: 'inter',
        fontWeight: '600',
        fontSize: 22,
    },
    price: {
        fontSize: 22,
        fontFamily: 'inter',
        marginTop: 0,
        fontWeight: '500',
        color: colors.loginBlue,
    },
    // createdAt: {
    //     fontFamily: 'inter',
    //     fontSize: 16,
    //     fontWeight: '400',
    //     color: colors.accentGray
    // },
    upperTextContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    }
})