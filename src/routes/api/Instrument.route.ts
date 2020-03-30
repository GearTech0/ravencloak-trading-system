import { PathParams } from 'express-serve-static-core';
import { map, mergeMap } from 'rxjs/operators';
import { RouteType } from "../Router.exports";
import { Request, Response, request, NextFunction } from "express";
import Instrument from "../../robinhood/classes/Instrument.class";
import { ReturnEnvelope, InstrumentInformation, InstrumentReference } from '../../robinhood/Robinhood.exports';
import { Robinhood } from '../../robinhood/Robinhood.api';

export default class InstrumentRoute extends RouteType {

    private createReferenceObject(type: string, id: string): InstrumentReference {
        if (!(type || id)) {
            throw 'Type or ID not specified. Usage: .../instruments/{type}/{id}/...';
        }
        return {
            instrument_id: (type === 'id') ? id : null,
            symbol: (type === 'symbol') ? id : null
        };
    }
    
    constructor(path: PathParams) {
        super(path);

        this.handle.use('/:type/:id', (request: Request, response: Response, next: NextFunction) => {
            request['instrRef'] = this.createReferenceObject(request.params.type, request.params.id);
            next();
        });

        this.handle.get('/:type/:id', (request: Request, response: Response) => {
            this.Try(response, () => {
                Robinhood
                    .getInstrument(request['instrRef'])
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        response.status(200).json(returnEnvelope);
                    });
            });
        });

        this.handle.post('/:type/:id/add', (request: Request, response: Response) => {
            this.Try(response, () => {
                Robinhood
                    .addInstrument(request['instrRef'], request.body.loadHistory, request.headers.authorization)
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        response.status(200).json(returnEnvelope);
                    });
            });
        });

        this.handle.post('/:type/:id/init', (request: Request, response: Response) => {
            this.Try(response, () => {
                Robinhood
                    .initInstrumentHistory(request['instrRef'], request.body, request.headers.authorization)
                    .subscribe((returnEnvelope: ReturnEnvelope) => {
                        response.status(200).json(returnEnvelope);
                    });
            });
        });

        this.handle.post('/:type/:id/quote', (request: Request, response: Response) => {
            this.Try(response, () => {

            });
        });

        this.handle.get('/:type/:id/update', (request: Request, response: Response) => {
            this.Try(response, () => {
                response.status(200).json({message: 'This endpoint has yet to been added.'});
            });
        })
    }
}