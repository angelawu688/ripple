import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';




const PersonalInformation = () => {
    const { user } = useContext(userContext)
    console.log(user)
    return (
        <View style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '90%', height: '100%', alignSelf: 'center' }}>


            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Net ID
                    </Text>
                    <Text style={styles.lowerText} numberOfLines={1} ellipsizeMode="tail">phunt22@uw.edu</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Name
                    </Text>
                    <Text style={styles.lowerText}>scHoolboy Q</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Bio
                    </Text>
                    <Text style={styles.lowerText}></Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Major
                    </Text>
                    <Text style={styles.lowerText}>not CS</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Graduation
                    </Text>
                    <Text style={styles.lowerText}>phunt22@uw.edu</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        Instagram
                    </Text>
                    <Text style={styles.lowerText}>@daxflame</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}>
                        LinkedIn
                    </Text>
                    <Text style={styles.lowerText}>https://www.linkedin.com/in/william-hunt-7895a3212/</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={[styles.cardContainer, { borderBottomWidth: 0 }]}>
                <View style={styles.textContainer}>
                    <Text style={styles.upperText}

                    >
                        Twitter/X
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode='tail'

                        style={[styles.lowerText]}>@beabadoobee</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        console.log('pressed')
                    }}
                >
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                </TouchableOpacity>
            </View>




        </View >
    )
}

export default PersonalInformation;


const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        paddingVertical: 14,
        marginTop: 12,
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 0,
        maxWidth: '85%'

    },
    upperText: {
        fontSize: 12,
        fontFamily: 'inter',
        color: 'gray'
    },
    lowerText: {
        fontFamily: 'inter', fontSize: 16,
        color: 'black'
    },
})