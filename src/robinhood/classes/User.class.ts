import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HTTPS } from '../../controllers/Request.controller';
import { ROBINHOOD_HOST, UserStatus, ReturnEnvelope, AccessTokenResponse } from '../Robinhood.exports';

export default class RobinhoodUser {
    public username: string;
    public deviceID: string = v4();
    public token: AccessTokenResponse = null;
    
    private status: UserStatus = 'no-auth';
    private cachePath: string;
    private clientID = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS';

    constructor(username: string) {
        const email = username.split('@');
        
        this.cachePath = path.join(__dirname, `../../security/${email[0]}.cache.json`);
        
        // Check if this user has already been cached
        let userCache: any;
        if (userCache = RobinhoodUser.readCache(this.cachePath)) {
            this.username = userCache.username;
            this.deviceID = userCache.deviceID;
            this.token = userCache.token;
            console.log('User read from cache');
        } else {
            // User does not have a cache
            this.username = username;
        }

    }

    public getStatus(): UserStatus {
        return this.status;
    }

    public getMyAuthToken(): string {
        return `${this.token.token_type} ${this.token.access_token}`;
    }

    public static readCache(cachePath: string): any {
        try {
            let cache: Buffer;
            if (cache = fs.readFileSync(cachePath)) {
                return JSON.parse(cache.toString());
            }
        } catch (e) {
            return null;
        }
    }

    public writeCache(): boolean {
        try {
            const toWrite = JSON.stringify({
                username: this.username,
                deviceID: this.deviceID,
                token: this.token
            });
    
            fs.writeFileSync(this.cachePath, toWrite);
            console.log(`Cached user ${this.username} to local cache\nCache Location: ${this.cachePath}`);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public login(password: string, challengeType?: 'sms' | 'email', challengeID?: string): Observable<ReturnEnvelope> {
        const apiPath = '/oauth2/token/';

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
            client_id: this.clientID,  // Seems that it could be the same
            device_token: this.deviceID, // can be random. does expiration date refer to this or client_id?
            username: this.username,
            password: password
        };

        if (challengeType) {
            body['challenge_type'] = challengeType;
        } 

        return HTTPS
            .post(`https://${ROBINHOOD_HOST}${apiPath}`, null, body, options)
            .pipe(
                map((data: string, index: number) => {
                    const response = JSON.parse(data);
                    let returnEnvelope = {
                        message: '',
                        status: this.status,
                        data: null
                    };

                    if (response.access_token)
                    {
                        this.token = response;

                        // User has logged in. Save user info to cache
                        const cached: boolean = this.writeCache();

                        returnEnvelope.status = this.status  = (cached) ? 'authenticated' : 'error';
                        returnEnvelope.message = (cached) ? 'Logged in' : 'Cashing error';
                        returnEnvelope.data = response;

                        return returnEnvelope;
                    } else if (response.detail) {
                        returnEnvelope.message = response.detail;

                        switch(response.detail) {
                            case 'Request blocked, challenge type required.':
                                returnEnvelope.data = response.accept_challenge_types;
                                returnEnvelope.status = this.status = 'challenge-type';
                                break;
                            case 'Request blocked, challenge issued.':
                                returnEnvelope.data = response.challenge;
                                returnEnvelope.status = this.status = 'challenge-issued';
                                break;
                            default:
                                returnEnvelope.status = this.status = 'error';
                                break;
                        }
                    } else {
                        returnEnvelope.message = response;
                        returnEnvelope.status = 'error';
                    }

                    return returnEnvelope;
                })
            );
    }

    public logout(): Observable<ReturnEnvelope> {
        const apiPath = '/oauth2/revoke_token/';

        // Get user's cache
        const cachedUser = fs.readFileSync(this.cachePath).toString();
        const parsedCachedUser = JSON.parse(cachedUser);

        const body = {
            client_id: this.clientID,
            token: parsedCachedUser.token.refresh_token
        };

        return HTTPS
                    .post(`https://api.robinhood.com${apiPath}`, null, body)
                    .pipe(
                        map((data: string, index: number) => {
                            const response = JSON.parse(data);

                            let message = '';
                            
                            const isEmpty = Object.values(response).length == 0;
                            if (isEmpty) {
                                this.status = 'no-auth';
                                message = 'Successfully logged out';
                                fs.writeFileSync(this.cachePath, 'no-auth');
                            } else {
                                this.status = 'error';
                                message = 'Error logging out';
                            }

                            return {
                                message: message,
                                status: this.status,
                                data: response
                            };
                        })
                    );
    }
}