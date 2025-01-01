import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { colors } from '../constants/colors';

const ArcSpinner = ({ size, strokeWidth, gradientColors, position, duration, counterClockwise = false }) => {
    // Create a ref for the animation to persist across renders
    const spinValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null);

    const createArcPath = () => {
        const radius = (size - strokeWidth) / 2;
        const center = size / 2;
        const startAngle = 0;
        const endAngle = 180;
        const start = (startAngle * Math.PI) / 180;
        const end = (endAngle * Math.PI) / 180;
        const startX = center + radius * Math.cos(start);
        const startY = center + radius * Math.sin(start);
        const endX = center + radius * Math.cos(end);
        const endY = center + radius * Math.sin(end);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    };

    useEffect(() => {
        const createAnim = () => {
            spinValue.setValue(0);
            animationRef.current = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                    isInteraction: false, // prevents interruption/hitching
                }),
                { iterations: -1 } // infinite
            );

            // Start the animation
            animationRef.current.start();
        };

        createAnim();

        // cleanup
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, []);


    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: counterClockwise ? ['360deg', '0deg'] : ['0deg', '360deg'],
        extrapolate: 'extend' // goes beyond range smoothly
    });

    const gradientId = `gradient-${position.x}-${position.y}-${size}`;

    return (
        <View style={{
            position: 'absolute',
            left: position.x - size / 2,
            top: position.y - size / 2,
            width: size,
            height: size,
        }}>
            <Animated.View style={{
                width: size,
                height: size,
                transform: [{ rotate: spin }]
            }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            {gradientColors.map((color, index) => (
                                <Stop
                                    key={index}
                                    offset={`${(index * 100) / (gradientColors.length - 1)}%`}
                                    stopColor={color}
                                    stopOpacity="1"
                                />
                            ))}
                        </LinearGradient>
                    </Defs>
                    <Path
                        d={createArcPath()}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
};

const LoadingSpinner = ({ size = 24 }) => {
    const center = size / 2;
    const strokeWidth = 5 / 132 * size

    // Updated spinner configurations to include gradient colors
    const spinners = [
        {
            size: size,
            strokeWidth: strokeWidth,
            gradientColors: [colors.gradientEnd, colors.gradientMiddle, colors.gradientEnd],
            position: { x: center, y: center },
            duration: 2000,
            counterClockwise: false
        },
        {
            size: size * 0.7,
            strokeWidth: strokeWidth,
            gradientColors: [colors.gradientEnd, colors.gradientMiddle, colors.gradientEnd],
            position: { x: center, y: center },
            duration: 1500,
            counterClockwise: true
        },
        {
            size: size * 0.4,
            strokeWidth: strokeWidth,
            gradientColors: [colors.gradientEnd, colors.gradientMiddle, colors.gradientEnd],
            position: { x: center, y: center },
            duration: 1000,
            counterClockwise: false
        }
    ];

    return (
        <View style={{
            width: size,
            height: size,
            position: 'relative'
        }}>
            {spinners.map((spinner, index) => (
                <ArcSpinner key={index} {...spinner} />
            ))}
        </View>
    );
};

export default LoadingSpinner;