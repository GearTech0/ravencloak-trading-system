import fs from 'fs';
import path from 'path';
import { Response, Request } from 'express';
import { PathParams } from 'express-serve-static-core';

import { RouteType } from '../Router.exports';
import { Robinhood } from '../../robinhood/Robinhood.api';
import { HTTPS } from '../../controllers/Request.controller';
import { ReturnEnvelope } from '../../robinhood/Robinhood.exports';

const secure_info = fs.readFileSync(path.join(__dirname, '../../security/auth.security.json')).toString();
const parsedSecureInfo = JSON.parse(secure_info);

export default class ChallengeRoute extends RouteType{
    private challenge: any;

    constructor(path: PathParams) {
        super(path);
        
        this.handle.get('/:type', (req: Request, res: Response) => {
            if (Robinhood.users[parsedSecureInfo.username].getStatus() == 'challenge-type') {
                var type = (<'sms' | 'email'>req.param('type'));
                Robinhood.login(parsedSecureInfo.username, parsedSecureInfo.password, type)
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        this.challenge = returnEnvelope.data;
                        res.status(200).json(this.challenge);
                    });
            } else {
                res.status(400).json({message: "A challenge type is not expected."});
            }
        })

        this.handle.post('/respond', (req: Request, res: Response) => {
            if (req.body.response) {
                HTTPS
                    .post(`https://api.robinhood.com/challenge/${this.challenge.id}/respond/`, null, {response: req.body.response})
                    .subscribe((data: string) => {
                        try {
                            const challengeResponse = JSON.parse(data);
                            if (challengeResponse.status == 'validated') {
                                Robinhood.login(parsedSecureInfo.username, parsedSecureInfo.password, this.challenge.type, this.challenge.id)
                                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                                        res.status(200).json(returnEnvelope);
                                    });
                            } else {
                                res.status(400).json({message: challengeResponse})
                            }
                        } catch(e) {
                            console.error(e);
                            res.status(400).json({message: data});
                        }
                    });
            } else {
                res.status(400).json({message: "No response added to body"});
            }
        });
    }
}