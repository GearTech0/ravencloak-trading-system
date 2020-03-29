import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { 
    ReturnEnvelope, 
    InstrumentStatus, 
    IterateParams,
    Interval, 
    BoundsType,
    Span,
    ROBINHOOD_HOST,
    HistoryRecord,
    HistoricalBag,
    RobinhoodStatus
} from "../Robinhood.exports";
import { OutgoingHttpHeaders } from "http";
import { HTTPS } from '../../controllers/Request.controller';
import { ParsedUrlQuery } from "querystring";

// See how robinhood updates/adds the open_price
export default class Instrument {
    public information: any;
    public status: InstrumentStatus;
    public historicalBag: HistoricalBag;

    constructor(information: any) {
        this.information = information;
    }

    /**
     * Get an instrument (stock) information 
     * @param identifier 
     * @param isSymbol 
     */
    public static GetInstrument(identifier: string, isSymbol: boolean = false): Observable<ReturnEnvelope> {
        let apiPath = `/instruments/`;
        let queryParams = null;
        if (isSymbol) {
            queryParams = {
                symbol: identifier
            };
        } else {
            apiPath = `${apiPath}${identifier}/`;
        }

        return HTTPS
            .get(`https://${ROBINHOOD_HOST}${apiPath}`, queryParams)
            .pipe(map((data: string, index: number) => {
                let errorText = 'There was an error creating object.';
                try {
                    const instrumentInformation = JSON.parse(data);
                    return {
                        message: 'Instrument Information',
                        status: 'loaded',
                        data: (instrumentInformation.results) ? instrumentInformation.results : instrumentInformation
                    }

                } catch (e) {
                    return {
                        message: 'There was an error creating object.',
                        status: 'error',
                        data: {
                            error: e,
                            server_response: data
                        }
                    };
                }
            }));
    }

    /**
     * Gets {count} local history reports from this object, where count
     * will the amount from the most recent history report 
     * @param count the amount returned from the most recent history report
     * @returns An envelope with the information about retured history reports
     */
    public getLocalHistory(count?: number): ReturnEnvelope {
        let message = 'Here you are! :)';
        let status: InstrumentStatus = 'loaded';
        let data;
        if(this.status === 'fresh' || this.status === 'error') {
            message = `This instrument is in the ${this.status} state.`
            status = this.status = 'error';
        }

        // check if we even have history
        const lengthOfHistoricals = this.historicalBag.historicals.length;
        if (lengthOfHistoricals === 0 || lengthOfHistoricals < count) {
            message = 'Error retrieving historicals'
            status = this.status = 'error';
            data = {
                historical_count: lengthOfHistoricals,
                requested_count: count
            };
        } else {
            const requestedHistoricalList = this.historicalBag.historicals.slice(lengthOfHistoricals-(count+1), lengthOfHistoricals-1);

            data = requestedHistoricalList;
        }
        
        return {
            message: message,
            status: status,
            data: data
        };
    }

    public initHistory(auth: string, iterationInfo: IterateParams): Observable<ReturnEnvelope> {
        const apiPath = `/marketdata/historicals/${this.information.symbol}/`;

        if (this.status !== 'loaded') {
            this.status = 'error';
            return of({
                message: 'The instrument has not yet been loaded',
                status: this.status
            });
        }

        const options: OutgoingHttpHeaders = {
            Authentication: auth
        };
        const queryParams: ParsedUrlQuery = {
            interval: iterationInfo.interval,
            span: iterationInfo.span,
            bounds: iterationInfo.bounds
        };

        return HTTPS
                .get(`https://${ROBINHOOD_HOST}${apiPath}`, queryParams, options)
                .pipe(map((historicalBagRes: string, index: number) => {
                    try {
                        const bag: HistoricalBag = JSON.parse(historicalBagRes) as HistoricalBag;
                        
                        // update local historical data
                        this.historicalBag = bag;

                        this.status = 'loaded'
                        return {
                            message: 'Imported historical bag',
                            status:  this.status,
                            data: {
                                name: this.historicalBag.symbol,
                                open_time: this.historicalBag.open_time,
                                instrument_url: this.historicalBag.instrument,
                                quote_url: this.historicalBag.quote
                            }
                        };
                    } catch (e) {
                        this.status = 'error';
                        return {
                            message: 'Error retrieving historical bag',
                            status: this.status,
                            data: {
                                error: e,
                                server_response: historicalBagRes
                            }
                        }
                    }
                }));

    }
}