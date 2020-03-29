import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { parse as QueryParse, stringify as QueryStringify } from 'querystring';

import RobinhoodUser from './classes/User.class';
import { HTTPS } from '../controllers/Request.controller';
import { ReturnEnvelope, ROBINHOOD_HOST } from './Robinhood.exports';

export class RobinhoodAPI {
    public users: {[key:string]: RobinhoodUser} = {};

    constructor() {

    }

    public login(username: string, password: string, challengeType?: 'sms' | 'email', challengeID?: string): Observable<ReturnEnvelope> {
        if (!this.users[username]) {
            this.users[username] = new RobinhoodUser(username);
        }

        return this.users[username]
            .login(password, challengeType, challengeID);
    }

    public logout(username: string, deviceID: string): Observable<ReturnEnvelope> {
        if (this.users[username] && this.users[username].deviceID === deviceID && this.users[username].getStatus() == 'authenticated') {
            return this.users[username].logout();
        }

        return of({
            message: 'User is not logged in',
            status: 'error',
            data: null
        });
    }
}

const Robinhood = new RobinhoodAPI();

export { Robinhood };