import { PathParams } from 'express-serve-static-core';

import { RouteType } from "../Router.exports";
import { Request, Response } from 'express';
import { Robinhood } from '../../robinhood/Robinhood.api';
import { ReturnEnvelope } from '../../robinhood/Robinhood.exports';

export default class UserRoute extends RouteType{
    constructor(path: PathParams) {
        super(path);

        this.handle
            .post('/login', (request: Request, response: Response) => {
                Robinhood
                    .login(request.body.username, request.body.password)
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