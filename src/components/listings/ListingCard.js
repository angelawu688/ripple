import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { memo, useEffect, useState } from 'react'
import { colors } from '../../constants/colors';
import { MotiView } from 'moti';
import { Dimensions } from 'react-native';


const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (SCREEN_WIDTH - 6) / 2; // accounting for the gaps
const ITEM_HEIGHT = ITEM_WIDTH + 50; // adding extra height for the text



const ListingCard = ({ listing }) => {
    if (!listing) {
        return null;
    }
    const { price, title, sold } = listing;
    const firstImage = listing?.photos[0]
    const photoUrl = typeof firstImage === 'object'
        ? {
            uri: firstImage.card,
            placeholder: firstImage.thumbnail // use the thumbnail
        }
        : { uri: firstImage }; // fallback to single image



    // const [img, setImg] = useState(undefined)
    // ensuring that we dont try to render images that are undefined
    // ie if photos is undefined, we cant get photos[0]
    // useEffect(() => {
    //     if (listing?.photos?.length > 0) {
    //         setImg(listing.photos[0])
    //     }
    // }, [listing])

    return (
        <View
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', marginBottom: 15 }}>
            <View style={{ borderRadius: 12, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F0F0' }}>
                {listing?.photos[0] ? (
                    <Image
                        source={{ uri: firstImage.card ? firstImage.card : firstImage }}
                        recyclingKey={firstImage}
                        cachePolicy="memory-disk"
                        transition={200}
                        placeholder={photoUrl.placeholder ? { uri: photoUrl.placeholder } : undefined}
                        style={{ width: '100%', aspectRatio: 1, borderRadius: 10 }}
                        // these two are used together
                        contentFit="cover"
                        contentPosition="center"

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


export default memo(ListingCard);