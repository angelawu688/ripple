import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { colors } from '../colors';
import { MotiView } from 'moti';

const ListingCard = ({ listing }) => {
    if (!listing) {
        return null;
    }

    const sold = listing.sold;
    const { price, title } = listing;
    const [img, setImg] = useState(undefined)
    // this code will grab the width of the component. We set the height to make it a square + the title
    const [width, setWidth] = useState(0);

    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };

    // ensuring that we dont try to render images that are undefined
    // ie if photos is undefined, we cant get photos[0]
    useEffect(() => {
        if (listing?.photos?.length > 0) {
            setImg(listing.photos[0])
        }
    }, [listing])

    return (
        <View onLayout={handleLayout}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', marginBottom: 15 }}>
            <View style={{ borderRadius: 12, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F0F0' }}>
                {img ? (
                    <Image
                        source={{ uri: img }}
                        style={{ width: '100%', aspectRatio: 1, borderRadius: 10 }}

                    />) : (<View
                        style={{ width: '100%', aspectRatio: 1, }}
                    />)
                }

                {sold && (
                    <Text style={{
                        color: 'white', fontSize: 28, fontWeight: '900', position: 'absolute',
                    }}>SOLD</Text>
                )}

            </View>

            <Text
                style={{
                    fontSize: 18,
                    marginLeft: '5%',
                    marginTop: 10,
                    marginBottom: 0,
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