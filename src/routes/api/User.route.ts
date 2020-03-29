import { PathParams } from 'express-serve-static-core';
import { map, concatAll } from 'rxjs/operators';

import { RouteType } from "../Router.exports";
import { Request, Response } from 'express';
import { Robinhood } from '../../robinhood/Robinhood.api';
import { ReturnEnvelope } from '../../robinhood/Robinhood.exports';
import Instrument from '../../robinhood/classes/Instrument.class';

export default class UserRoute extends RouteType{
    constructor(path: PathParams) {
        super(path);

        this.handle
            .post('/login', (request: Request, response: Response) => {
                console.log(request.body);
                Robinhood
                    .login(request.body.username, request.body.password)
                    .pipe(map((returnEnvelope: ReturnEnvelope, index: number) => {
                        return Instrument.GetInstrument('SPYG', true)
                    }),
                    concatAll()
                    )
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        response.status(200).json(returnEnvelope);
                    });
            });
        
        this.handle
            .post('/logout', (request: Request, response: Response) => {
                Robinhood
                    .logout(request.body.username, request.body.deviceID)
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        response.status(200).json(returnEnvelope);
                    });
            });
    }
}