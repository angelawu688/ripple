import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { colors } from "../constants/colors";

const HIDDEN_ROUTES = {
    'MessagesStack': ['Conversation'],
    'MarketplaceStack': ['CreateListing', 'ListingScreen'],
};

export function useTabBarVisibility(route) {
    const routeName = getFocusedRouteNameFromRoute(route)
    const shouldHide = HIDDEN_ROUTES[route.name]?.includes(routeName)

    if (shouldHide) {
        return { display: 'none' }
    }

    return {
        backgroundColor: colors.white,
        paddingTop: 12,
        borderTopWidth: 0.5
    }
}