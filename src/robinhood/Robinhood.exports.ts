export const ROBINHOOD_HOST = "api.robinhood.com";

export type UserStatus = 'no-auth' | 'challenge-type' | 'challenge-issued' | 'authenticated' | 'error';
export type InstrumentStatus = 'loaded' | 'fresh' | 'error';


export type RobinhoodStatus = UserStatus | InstrumentStatus;

export type Symbols = Array<string>;
export type Instruments = Array<URL>;
export type InstrumentReferenceType = Symbols | Instruments;
export type HistoricalParams = IterateParams & (Symbols | Instruments);

export type Span = 'day' | 'week' | 'year' | '5year' | 'all';
export type BoundsType = 'regular' | 'trading' | 'extended';
export type Interval = 'week' | 'day' | '10minute' | '5minute' | 'null';

export interface IterateParams {
    bounds?: BoundsType;
    span?: Span;
    interval: Interval;
}

export interface ReturnEnvelope {
    message?: string;
    status?: RobinhoodStatus; 
    data?: any
};

export interface AccessTokenResponse {
    access_token: string,
    expires_in: number,
    token_type: 'Bearer',
    scope: 'internal' | 'read' | 'write',
    refresh_token: string
}

export interface RobinhoodAccessTokenExtras {
    mfa_code: string | null,
    backup_code: string | null
}

export type Historical = HistoryRecord; // because i like the name HistoryRecord
export interface HistoryRecord {
    begins_at: string;
    open_price: string;
    close_price: string;
    high_price: string;
    low_price: string;
    volume: number;
    session: 'pre' | 'reg' | 'post';
    interpolated: boolean;
}

export interface HistoricalBag {
    quote: string,
    symbol: string,
    interval: Interval,
    span: Span,
    bounds: BoundsType,
    previous_close_price: string,
    previous_close_time: string,
    open_price: string,
    open_time: string,
    instrument: string,
    historicals: Array<HistoryRecord>
}