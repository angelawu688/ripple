import { View, Text } from 'react-native'

const ListingScreen = ({ route }) => {
    const { listingID } = route.params
    return (
        <View style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Text>
                ListingScreen with ID {listingID}
            </Text>
        </View>
    )
}

export default ListingScreen;