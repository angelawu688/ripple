// import React from 'react';
// import { Animated, View } from 'react-native';
// import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
// import { colors } from '../../colors';


// const Wave = ({ width, color, animatedStyle }) => {
//     return (
//         <Animated.View style={[{ position: 'absolute', top: 0, width }, animatedStyle]}>
//             <Svg height={width} width={width} viewBox={`0 0 ${width} ${width / 2.8}`}>
//                 <Defs>
//                     <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">

//                         <Stop offset="100%" stopColor={color ? color : colors.neonBlue} stopOpacity="0.2" />
//                     </LinearGradient>
//                 </Defs>
//                 <Path
//                     d="M616 126.651C616 343.436 479.895 126.651 312 126.651C144.105 126.651 8 343.436 8 126.651C8 -90.1327 179.671 56.4385 347.565 56.4385C515.46 56.4385 616 -90.1327 616 126.651Z"
//                     fill="url(#grad)"
//                 />
//             </Svg>
//         </Animated.View>
//     )

// }

// export default Wave;
import React from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../colors';

export const Wave = ({ width, color, animatedStyle }) => {
    // Define the aspect ratio of the original path
    const aspectRatio = 616 / 126.651; // width / height of original design

    // Dynamically calculate height based on width
    const height = width / aspectRatio * 3;

    return (
        <Animated.View style={[{ position: 'absolute', top: 0, width, height },
            animatedStyle

        ]}>
            <Svg height={height} width={width} viewBox={`0 0 616 126.651`}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="100%" stopColor={color || colors.neonBlue} stopOpacity="0.2" />
                    </LinearGradient>
                </Defs>
                <Path
                    d="M616 126.651C616 343.436 479.895 126.651 312 126.651C144.105 126.651 8 343.436 8 126.651C8 -90.1327 179.671 56.4385 347.565 56.4385C515.46 56.4385 616 -90.1327 616 126.651Z"
                    fill="url(#grad)"
                />
            </Svg>
        </Animated.View>
    );
};

export const Wave2 = ({ width, color, animatedStyle }) => {

    // "M421.207 128.024C444.942 262.633 316.176 132.385 189.6 154.704C63.0239 177.023 -13.4298 343.456 -37.165 208.847C-52.2839 -171.651 91.3862 111.704 217.962 89.3851C461.278 54.524 397.472 -6.58515 421.207 128.024Z"
    const aspectRatio = 470 / 246; // width / height of original design

    // Dynamically calculate height based on width
    const height = width / aspectRatio * 3;

    return (
        <Animated.View style={[{ position: 'absolute', top: 0, width, height },
            animatedStyle

        ]}>
            <Svg height={height} width={width} viewBox={`-40 0 470 246`}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="100%" stopColor={color || colors.neonBlue} stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>
                <Path
                    d="M421.207 128.024C444.942 262.633 316.176 132.385 189.6 154.704C63.0239 177.023 -13.4298 343.456 -37.165 208.847C-52.2839 -171.651 91.3862 111.704 217.962 89.3851C461.278 54.524 397.472 -6.58515 421.207 128.024Z"
                    fill="url(#grad)"
                />
            </Svg>
        </Animated.View>
    );
}