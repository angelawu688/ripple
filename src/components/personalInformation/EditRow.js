import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import Asterisk from '../Asterisk';

export function FieldRow({
    label,
    value,
    canEdit = true,
    onEditPress,
    required = false
}) {
    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>
                <Text style={styles.upperText}>{label}</Text>
                {required && <Asterisk />}
            </View>
            <View style={styles.lowerContainer}>
                <Text style={styles.lowerText}
                    //   numberOfLines={1} // put this back if you want to test out single line/truncating
                    ellipsizeMode="tail">
                    {value}
                </Text>
                {canEdit && <TouchableOpacity onPress={onEditPress}>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>}

            </View>
        </View>
    );
};

export default FieldRow;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'gray',
        marginTop: 15,
    },
    upperContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        marginLeft: 15,
        paddingBottom: 4
    },
    lowerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.bgGray,
        paddingVertical: 8,
        borderRadius: 15,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 5,
    },
    lowerText: {
        fontFamily: 'Inter',
        fontSize: 16,
        color: 'black',
        maxWidth: '85%'
    },
    textContainer: {
        maxWidth: '85%',
    },
    upperText: {
        fontSize: 14,
        fontFamily: 'Inter',
        color: colors.loginBlue,
    },
    lowerTextContainer: {
        backgroundColor: colors.mediumGray
    },
});
