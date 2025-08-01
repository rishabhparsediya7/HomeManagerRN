import { authorize } from 'react-native-app-auth'

export const signInWithGitHub = async () => {
    const config = {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        redirectUrl: 'com.expensemanagerrn://oauthredirect',
        issuer: 'https://github.com/login/oauth',
        scopes: ['read:user', 'user:email'],
        serviceConfiguration: {
            authorizationEndpoint: 'https://github.com/login/oauth/authorize',
            tokenEndpoint: 'https://github.com/login/oauth/access_token',
        },
    }
    try {
        const result = await authorize(config)
        return result
    } catch (error:any) {
        console.error('GitHub login error:', error)
        return { success: false, error: error.message }
    }
}