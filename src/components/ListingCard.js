import { View, Text, Image } from 'react-native'
import { useState } from 'react'




// TODO we will want to pass in an entire listing eventually
const ListingCard = ({ price, title, img, sold }) => {

    // this code will grab the width of the component. We set the height to make it a square + the title
    const [width, setWidth] = useState(0);
    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };
    return (
        <View onLayout={handleLayout}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
            {img ? (
                <Image src={img} />
            ) : (
                <View style={{ borderRadius: 12, backgroundColor: 'gray', width: '100%', height: width, justifyContent: 'center', alignItems: 'center' }}>
                    {sold && (
                        <Text style={{ color: 'black', fontSize: 70, opacity: 0.4, fontWeight: '900' }}>SOLD</Text>
                    )}
                </View>
            )}
            <Text style={{ fontSize: 18, marginLeft: '5%', marginTop: 10, marginBottom: 15, }} numberOfLines={1}>
                ${price + " "} | {" " + title}
            </Text>
        </View>
    )
}


export default ListingCard;