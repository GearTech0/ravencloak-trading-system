import RobinhoodAPI from "../robinhood/robinhood.api";

declare module 'express-serve-static-core' {
    interface Request {
        Robinhood?: RobinhoodAPI;
    }
}