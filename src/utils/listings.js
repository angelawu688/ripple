export const renderPrice = (price) => {
    if (price === 0) {
        return 'Free'
    }
    // undefined
    if (price === undefined || price === null) {
        return '$-.--'
    }

    // price has a .
    if (price % 1 !== 0) {
        return `$${price.toFixed(2)}`
    } else {
        return `$${price}`
    }
}