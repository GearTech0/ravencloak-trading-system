import { RouteType } from "../Router.exports";
import { PathParams } from 'express-serve-static-core';

export default class InstrumentRoute extends RouteType {
    
    constructor(path: PathParams) {
        super(path);

        
    }
}