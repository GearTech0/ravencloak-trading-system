import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { parse as QueryParse, stringify as QueryStringify } from 'querystring';

import RobinhoodUser from './classes/User.class';
import { RequestController } from '../controllers/Request.controller';
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

    public getInstrument(): Observable<ReturnEnvelope> {
        const apiPath = '/marketdata/historicals/SPYG/';
        const params = {
            bounds: 'trading',
            interval: '5minute',
            span: 'day'
        }

        // This just gets historicals. Update to get the Instrument itself then download 
        // its specific market data for the day
        return RequestController
            .get(`https://${ROBINHOOD_HOST}${apiPath}`, params)
            .pipe(map((data: string, index: number) => {
                const response = JSON.parse(data);

                return {
                    message: '',
                    status: 'error',
                    data: response
                };
            }));
    }
}

const Robinhood = new RobinhoodAPI();

export { Robinhood };