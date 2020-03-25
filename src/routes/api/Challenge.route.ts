import { Router, Response, Request } from 'express';
import { RouteType } from '../Route.type';
import { Robinhood } from '../../robinhood/robinhood.api';
import { PathParams } from 'express-serve-static-core';
import fs from 'fs';
import path from 'path';
import RequestController from '../../controllers/Request.controller';

const secure_info = fs.readFileSync(path.join(__dirname, '../../security/secure.json')).toString();
const parsedSecureInfo = JSON.parse(secure_info);

export default class ChallengeRoute implements RouteType{
    private handle = Router();
    private challenge: any;
    private https: RequestController;
    private path: PathParams;

    constructor(path: PathParams) {
        this.path = path;
        this.https = new RequestController();
        this.handle.get('/:type', (req: Request, res: Response) => {
            if (Robinhood.status == 'challenge') {
                var type = (<'sms' | 'email'>req.param('type'));
                Robinhood.login(parsedSecureInfo.username, parsedSecureInfo.password, type)
                    .subscribe((challenge) => {
                        this.challenge = challenge;
                        res.status(200).json(this.challenge);
                    });
            } else {
                res.status(400).json({message: "A challenge is not expected."});
            }
        })

        this.handle.post('/respond', (req: Request, res: Response) => {
            if (req.body.response) {
                const options = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                this.https
                    .post(`https://api.robinhood.com/challenge/${this.challenge.id}/respond/`, null, JSON.stringify({response: req.body.response}), options)
                    .subscribe((data) => {
                        const challengeResponse = JSON.parse(data);
                        if (challengeResponse.status == 'validated') {
                            Robinhood.login(parsedSecureInfo.username, parsedSecureInfo.password, this.challenge.type, this.challenge.id)
                                .subscribe((val) => {
                                    console.log(val);
                                    Robinhood.status = 'logged-in';
                                    res.status(200).json({message: "Logged in"});
                                });
                        } else {
                            res.status(400).json({message: challengeResponse})
                        }
                    });
            } else {
                res.status(400).json({message: "No response added to body"});
            }
        });
    }

    public Register(router: Router): void {
        router.use(this.path, this.handle);
    }
}