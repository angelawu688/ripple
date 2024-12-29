import * as Linking from 'expo-linking';
export const links = {
    privacyPolicy: 'https://docs.google.com/document/d/12vu0KAYGCGzP_R9KJzGDaoZ8OIaP_zT37PyDmbA8uRo/edit?tab=t.0',
    termsOfService: 'https://docs.google.com/document/d/1jWatOlldlFwbQfaYQnpKZis8YelfF7cWa_dQcL5gQB4/edit?tab=t.0'
}

// ALLOWS FOR DEEP LINKS
// this needs a lot more testing lmao
export const linkingConfig = {
    // basically grabbing how the link will be created
    // i.e. if you are on dev you wont be able to try prod ones, vice versa
    // dont anticipate this being an issue
    // in prod, we will need to use firebase dynamic links to redirect users without the app to the app store
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Main: {
                screens: {
                    MarketplaceStack: {
                        screens: {
                            ListingScreen: 'listing/:listingID', // bring them to the info that was passed in
                            UserProfile: 'user/:userID', // same thing as above, now just with the user
                        },
                    },
                },
            },
            Auth: '*', // if no user profile, direct them to auth stack
        },
    },
};