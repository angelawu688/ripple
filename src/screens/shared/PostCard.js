import { Image, View } from "react-native"


const PostCard = ({ img, price, title, id }) => {

    return (
        <View>
            {img ? (
                <Image />
            ) : (
                <View style={{ backgroundColor: '#F2F0F0', width: 50, height: 50 }} />
            )}
        </View>
    )
}

export default PostCard;