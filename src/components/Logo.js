import React from "react";
import { Text, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';


const Logo = ({ fontSize }) => {

    const size = fontSize || 20

    return (
        <View style={{ justifyContent: "center", alignItems: "center", }}>
            <GradientText style={{ fontSize: size, fontFamily: 'Inter', fontWeight: '600', letterSpacing: -0.75 }}>Ripple</GradientText>
        </View>
    );
}

const GradientText = (props) => {
    return (
        <MaskedView
            style={{ flexDirection: "row" }}
            maskElement={
                <Text {...props} style={[props.style, { backgroundColor: "transparent" }]} />
            }
        >
            <LinearGradient
                colors={[colors.gradientTop, colors.gradientBottom]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{}}
            >
                <Text {...props} style={[props.style, { opacity: 0 }]} />
            </LinearGradient>
        </MaskedView>
    );
};


export default Logo;