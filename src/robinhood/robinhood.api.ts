import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { parse as QueryParse, stringify as QueryStringify } from 'querystring';

import RobinhoodUser from './classes/User.class';
import { HTTPS } from '../controllers/Request.controller';
import { ReturnEnvelope, ROBINHOOD_HOST, IterateParams, InstrumentReference } from './Robinhood.exports';
import Instrument from './classes/Instrument.class';
import { threadId } from 'worker_threads';

export class RobinhoodAPI {
    public users: Map<string, RobinhoodUser> = new Map();

    public instrumentPositionMap: Map<string, number> = new Map();
    public instruments: Array<Instrument> = [];

    constructor() {}

    private Exists(identifier: string, type: 'user' | 'instrument'): void {
        switch (type) {
            case 'user':
                if (!this.users[identifier]) {
                    throw 'User does not exist';
                }
                return;
            case 'instrument':
                if (!this.instrumentPositionMap.has(identifier)) {
                    throw 'Instrument does not exist';
                }
                return;
        }
    }

    private pushInstrument(instrument: Instrument): void {
        this.instruments.push(instrument);

        const instrumentCount = this.instruments.length;
        this.instrumentPositionMap.set(instrument.information.id, instrumentCount-1);
        this.instrumentPositionMap.set(instrument.information.symbol, instrumentCount-1);
    }

    public getInstrument(instrumentReference: InstrumentReference): Observable<ReturnEnvelope> {
        return Instrument
            .GetInstrument(instrumentReference)
            .pipe(map((returnEnvelope: ReturnEnvelope) => {
                return returnEnvelope;
            }));
    }

    public initInstrumentHistory(instrumentReference: InstrumentReference, iterationInfo: IterateParams, auth: string): Observable<ReturnEnvelope> {
        let instrumentIndex: number;
        let identifier: string = instrumentReference.instrument_id || instrumentReference.symbol;
        try {
            this.Exists(identifier, 'instrument');

            instrumentIndex = this.instrumentPositionMap.get(identifier);
            if (this.instruments[instrumentIndex].historicalBag) {
                throw 'History has already loaded for this instrument. Did you mean to use the "/update" path?';
            }

        } catch (e) {
            return of({
                message: e,
                status: 'error',
                data: {
                    identifier: identifier
                }
            });
        }
        return this.instruments[instrumentIndex]
                .initHistory(auth, iterationInfo);
    }

    public getQuote(auth: string, instrumentReference: InstrumentReference): Observable<ReturnEnvelope> {
        let instrumentIndex: number;
        let identifier: string = instrumentReference.instrument_id || instrumentReference.symbol;
        try {
            this.Exists(identifier, 'instrument');

            instrumentIndex = this.instrumentPositionMap.get(identifier);
        } catch (e) {
            return of({
                message: e,
                status: 'error',
                data: {
                    identifier: identifier
                }
            });
        }
        return this.instruments[instrumentIndex]
                .getQuote(auth);
    }

    public addInstrument(instrumentReference: InstrumentReference, loadHistory: boolean = false, auth: string = ''): Observable<ReturnEnvelope> {
        let instrumentIndex: number;
        let instrument: Instrument;
        let identifier: string = instrumentReference.instrument_id || instrumentReference.symbol;
        try {
            this.Exists(identifier, 'instrument');
            instrumentIndex = this.instrumentPositionMap.get(identifier)

            return of({
                message: 'This instrument already exists in the database.',
                status: 'error',
                data: {
                    identifier: identifier,
                    instrument: this.instruments[instrumentIndex].information
                }
            });
        } catch (e) {
            return Instrument
                .GetInstrument(instrumentReference)
                .pipe(map((returnEnvelope: ReturnEnvelope) => {
                    if (returnEnvelope.status === 'loaded') {
                        instrument = new Instrument(returnEnvelope.data);
    
                        this.pushInstrument(instrument);
                    }
                    return returnEnvelope;
                }),
                mergeMap((returnEnvelope: ReturnEnvelope) => {
                    // Load instrument
                    if (loadHistory) {
                        const iterationParams: IterateParams = {
                            interval: '5minute',
                            bounds: 'trading',
                            span: 'day'
                        }
                        return this
                            .initInstrumentHistory(instrumentReference, iterationParams, auth);
                    }
                    return of(returnEnvelope);
                }));
        }
        
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