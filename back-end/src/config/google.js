import {google} from 'googleapis'
const googleClient = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID || process.env.Google_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET || process.env.Google_CLIENT_SECRET,
	process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || process.env.GOOGLE_REDIRECT_URI || process.env.Google_REDIRECT_URL,
)

export default googleClient