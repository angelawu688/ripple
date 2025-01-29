import { Text, TouchableOpacity, Image, StyleSheet, Pressable, ScrollView, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'react-native'
import { X } from 'phosphor-react-native'

const SCOLL_DOWN_THRESHOLD = 50


export default function ZoomableImage({
    uri,
    thumbnailStyle,
    modalBackgroundColor = 'black' // idk if this will need to change but allowing for future changes
}) {
    const [isModalVisible, setIsModalVisible] = useState(false)

    return (
        <View style={styles.imageWrapper}>
            {/* THUMBNAIL */}
            <Pressable
                onPress={() => setIsModalVisible(true)}
            >
                <Image
                    source={{ uri: uri }}
                    style={thumbnailStyle}
                    resizeMode='cover'
                />
            </Pressable>
            {/* MODAL */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType='fade'
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                >
                    <X size={24} color='white' weight='bold' />
                </TouchableOpacity>
                <ScrollView
                    style={[styles.modalContainer, { backgroundColor: modalBackgroundColor }]}
                    contentContainerStyle={styles.scrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    pinchGestureEnabled={true} // this is what allows for the zoom
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}

                    // want to handle down scroll --> dismiss    
                    bounces={true}
                    onScrollEndDrag={({ nativeEvent }) => {
                        if (nativeEvent.contentOffset.y < SCOLL_DOWN_THRESHOLD) { // 

                            setIsModalVisible(false)
                        }
                    }}
                >
                    <Image
                        source={{ uri: uri }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </ScrollView>

            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    imageWrapper: {
        // flex: 1,
        // width: '100%',
    },
    modalContainer: {
        flex: 1,
    },
    scrollContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fullScreenImage: {
        width: '100%',
        height: '100%'
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 9999,
        padding: 10
    }
});