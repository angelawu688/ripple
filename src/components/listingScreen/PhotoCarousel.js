import { useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { colors } from "../../constants/colors";
import ZoomableImage from "../ZoomableImage";

export default function PhotoCarousel({ photos, sold }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleScroll = (event) => {
        // basically round into the nearest box
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const navigateToIndex = (index) => {
        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
        });
        setCurrentIndex(index);
    };

    return (
        <View style={carouselStyles.container} >
            <FlatList
                pagingEnabled
                ref={flatListRef}
                horizontal={true}
                data={photos}
                scrollEnabled={photos.length > 1} // wont scroll when only one photo
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    let url = ''
                    if (typeof item === 'object') {
                        url = item.full
                    } else {
                        url = item
                    }
                    return (
                        <View
                            style={{ height: width, width: width, alignSelf: 'center', justifyContent: 'center', }}
                        >

                            <ZoomableImage
                                uri={url}
                                thumbnailStyle={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                    backgroundColor: colors.loginGray
                                }}
                            />
                            {/* <Image
                                source={{ uri: url }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                    backgroundColor: colors.loginGray
                                }}
                                contentFit="cover"
                            /> */}
                            {sold && (
                                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%' }}>
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontSize: 100,
                                            fontWeight: '900',
                                            zIndex: 10,

                                        }}
                                    >
                                        SOLD
                                    </Text>
                                </View>
                            )}
                        </View>
                    )
                }
                } showsHorizontalScrollIndicator={false}
                onScroll={handleScroll} // manage state variable
                scrollEventThrottle={16} // slows down the rate of the event handler
            />
            {photos?.length > 1 && <View style={carouselStyles.indicatorContainer}>
                {photos.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => navigateToIndex(index)}
                        style={[
                            carouselStyles.indicatorButton,
                            currentIndex === index && carouselStyles.activeIndicator
                        ]}

                    />
                ))}
            </View>}

        </View >
    )
}

// styles up top to allow this to be moved if needed
const { width } = Dimensions.get("window");
const carouselStyles = StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: "center",
        height: width,
    },
    imageContainer: {
        width: width,
        height: width,
        borderRadius: 0,
        alignSelf: "center",
    },
    indicatorContainer: {
        position: "absolute",
        bottom: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignSelf: "center",
    },
    indicatorButton: {
        width: 8,
        height: 8,
        borderRadius: 5,
        backgroundColor: colors.loginGray,
        marginHorizontal: 2,
    },
    activeIndicator: {
        backgroundColor: colors.neonBlue,
        width: 8 // can make this bigger if you want
    },

})