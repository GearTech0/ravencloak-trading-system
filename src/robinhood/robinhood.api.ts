import fs from 'fs';
import path from 'path';
import { map } from 'rxjs/operators';
import RobinhoodUser from './types/User.robinhood';
import RequestController from '../controllers/Request.controller';
import { Observable, of } from 'rxjs';

const HOST = 'api.robinhood.com';
const CLIENT_ID = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS'
const USER_CACHE = path.join(__dirname, '../security/user.cache.json');

class RobinhoodAPI {
    public user: RobinhoodUser;
    public status: 'no-user' | 'challenge' | 'logged-in' | 'error';

    private client: RequestController;

    constructor() {
        this.status = 'no-user';
        this.client = new RequestController();
        this.user = new RobinhoodUser();
    }

    public login(username: string, password: string, challengeType?: 'sms' | 'email', challengeID?: string): Observable<any> {
        const apiPath = '/oauth2/token/'

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (challengeID) {
            options.headers['x-robinhood-challenge-response-id'] = challengeID;
        }
    
        const body = {
            grant_type: "password",
            scope: "internal",
            client_id: CLIENT_ID,  // Seems that it could be the same
            device_token: this.user.deviceID, // can be random. does expiration date refer to this or client_id?
            username: username,
            password: password
        };

        if (challengeType) {
            body['challenge_type'] = challengeType;
        } 

        return this.client
            .post(`https://${HOST}${apiPath}`, null, JSON.stringify(body), options)
            .pipe(
                map((data: string, index: number) => {
                    const response = JSON.parse(data);
                    if (response.access_token)
                    {
                        // User has logged in. Save user info to cache
                        this.user.username = username;
                        this.user.token = response;
            
                        const toWrite = this.user.cache();
            
                        fs.writeFileSync(USER_CACHE, toWrite);
                        console.log(`Cached user ${username} to local cache\nCache Location: ${USER_CACHE}`);

                        return 'success';
                    } else if (response.detail) {
                        switch(response.detail) {
                            case 'Request blocked, challenge type required.':
                                this.status = 'challenge';
                                return 'Waiting for challenge';
                                break;
                            case 'Request blocked, challenge issued.':
                                return response.challenge;
                                break;
                            default:
                                return 'Unknown detail!';
                                break;
                        }
                    } else {
                        console.log('Login Error:', response);
                    }
                })
            );
    }

    public logout(): void {
        // Get user's cache
        const cachedUser = fs.readFileSync(USER_CACHE).toString();
        const parsedCachedUser = JSON.parse(cachedUser);

        const options = {
            path: `/oauth2/revoke_token/`,
            headers: {
                //'Authorization': `${cachedUser.token.token_type} ${cachedUser.token.access_token}`
            }
        };

        const body = {
            client_id: parsedCachedUser.client_id,
            token: parsedCachedUser.token.refresh_token
        };
    }
}

const Robinhood = new RobinhoodAPI();

export { Robinhood };