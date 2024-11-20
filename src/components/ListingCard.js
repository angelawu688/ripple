import { View, Text, Image } from 'react-native'
import { useState } from 'react'
import { colors } from '../colors';


// TODO we will want to pass in an entire listing eventually
const ListingCard = ({ listing }) => {
    if (!listing) {
        console.log("undefined listing")
        return null;
    }
    // no photos or sold fields yet
    // const { price, title, photos, sold } = listing;
    // const img = photos && photos.length > 0 ? photos[0] : undefined;
    const img = undefined;
    const sold = listing.sold;
    const { price, title } = listing;
    // this code will grab the width of the component. We set the height to make it a square + the title
    const [width, setWidth] = useState(0);
    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };
    return (
        <View onLayout={handleLayout}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
            <View style={{ borderRadius: 12, width: '100%', height: width, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F0F0' }}>
                {img && (
                    <Image source={{ uri: img.uri }} />
                )}

                {sold && (
                    <Text style={{ color: 'black', fontSize: 70, opacity: 0.4, fontWeight: '900', position: 'absolute' }}>SOLD</Text>
                )}

            </View>



            <Text
                style={{
                    fontSize: 18,
                    marginLeft: '5%',
                    marginTop: 10,
                    marginBottom: 15,
                    fontWeight: '500'
                }}
                numberOfLines={1}
            >
                <Text style={{ color: colors.loginBlue, }}>
                    ${price}
                </Text>{" "}
                | {title}
            </Text>
        </View >
    )
}


export default ListingCard;