import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";



const SkeletonCard = () => {
    const [width, setWidth] = useState(0);
    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };
    return (
        <View onLayout={handleLayout}
            style={skeletonStyles.skeletonCardContainer}>
            <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.7 }}
                transition={{
                    type: 'timing',
                    duration: 750,
                    loop: true,
                }}
                style={[skeletonStyles.skeletonImage, { width: '100%', height: width }]}
            />
            <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.7 }}
                transition={{
                    type: 'timing',
                    duration: 750,
                    loop: true,
                }}
                style={skeletonStyles.skeletonSubtitle}
            />
        </View>
    );
};

const ListingsListSkeletonLoaderFull = () => {
    const data = Array.from({ length: 8 }); // will give us 8 cards, can adjust as needed

    return (
        <FlatList
            data={data}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => (<SkeletonCard />)}
            numColumns={2}
            columnWrapperStyle={skeletonStyles.column}
            contentContainerStyle={skeletonStyles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        />
    );
};

export default ListingsListSkeletonLoaderFull;

const skeletonStyles = StyleSheet.create({
    container: {
        width: '99%',
        alignSelf: 'center',
        paddingHorizontal: 2,
    },
    column: {
        justifyContent: 'space-between',
        marginTop: 0,
    },
    skeletonCardContainer: {
        width: '49.75%',
        marginBottom: 16,
    },
    skeletonImage: {
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        marginBottom: 10,
    },
    skeletonSubtitle: {
        width: '80%',
        height: 15,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },

})