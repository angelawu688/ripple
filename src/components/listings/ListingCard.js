import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { memo, useEffect, useMemo, useState } from 'react'
import { colors } from '../../constants/colors';
import { MotiView } from 'moti';
import { Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';


const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (SCREEN_WIDTH - 6) / 2; // accounting for the gaps
const ITEM_HEIGHT = ITEM_WIDTH + 50; // adding extra height for the text



const ListingCard = ({ listing }) => {

    if (!listing) {
        return null;
    }

    const { price, title, sold } = listing;
    const photoUrl = useMemo(() => {
        const firstImage = listing?.photos[0]
        return typeof firstImage === 'object'
            ? {
                uri: firstImage.card,
                placeholder: firstImage.thumbnail // use the thumbnail
            }
            : { uri: firstImage }; // fallback to single image
    }, [listing?.photos[0]])

    return (
        <View
            style={styles.container}>
            <View style={styles.imageContainer}>
                {listing?.photos[0] ? (
                    <Image
                        source={photoUrl}
                        recyclingKey={photoUrl}
                        // commenting this line out ironically gave a 3x imrpovement in initial fps lmfao
                        // cachePolicy="memory-disk"
                        cachePolicy="none"
                        transition={200}
                        placeholder={photoUrl.placeholder ? { uri: photoUrl.placeholder } : undefined}
                        style={styles.image}
                        // these two are used together
                        contentFit="cover"
                        contentPosition="center"

                    />) : (<View
                        style={styles.placeholder}
                    />)
                }
                {sold && (
                    <Text style={
                        styles.soldText
                    }>SOLD</Text>
                )}
            </View>
            <Text
                style={styles.title}
                numberOfLines={1}
            >
                <Text style={styles.priceText}>
                    ${price}
                </Text>{" "}
                | {title}
            </Text>
        </View >
    )
}


export default ListingCard;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 15
    },
    imageContainer: {
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F0F0'
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10
    },
    placeholder: {
        width: '100%',
        aspectRatio: 1,
    },
    soldText: {
        color: 'white',
        fontSize: 28,
        fontWeight: '900',
        position: 'absolute',
    },
    title: {
        fontSize: 18,
        marginLeft: '5%',
        marginTop: 10,
        marginBottom: 0,
        fontWeight: '500'
    },
    priceText: {
        color: colors.loginBlue,
    }

})  