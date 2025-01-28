import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-native'
import { X } from 'phosphor-react-native'

export default function ZoomableImage({
    uri,
    thumbnailStyle,
    modalBackgroundColor = 'black' // idk if this will need to change but allowing for future changes
}) {
    const [isModalVisible, setIsModalVisible] = useState(false)
    useEffect(() => {
        console.log(uri)
    }, [])
    return (
        <>
            {/* THUMBNAIL */}
            <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
            >
                <Image
                    source={{ uri: uri }}
                    style={thumbnailStyle}
                    resizeMode='cover'
                />
            </TouchableOpacity>

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
                    <X size={32} color='white' weight='bold' />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalContainer, { backgroundColor: modalBackgroundColor }]}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                >
                    <Image
                        source={{ uri: uri }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
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