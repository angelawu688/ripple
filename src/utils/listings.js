export const renderPrice = (price) => {
    if (!price || price < 0) {
        return '-.--'
    }

    // price has a .
    if (price % 1 !== 0) {
        return price.toFixed(2)
    } else {
        return price
    }
}