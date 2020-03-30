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

export interface InstrumentReference {
    symbol?: string;
    instrument_id?: string;
}

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

export interface Quote {
    ask_price: string,
    ask_size: number,
    bid_price: string,
    bid_size: number,
    last_trade_price: string,
    last_extended_hours_trade_price: string,
    previous_close: string,
    adjusted_previous_close: string,
    previous_close_date: string,
    symbol: string,
    trading_halted: boolean,
    has_traded: boolean,
    last_trade_price_source: string,
    updated_at: string,
    instrument: string
}

export interface InstrumentInformation {
    id: string,
    url: string,
    quote: string,
    fundamentals: string,
    splits: string,
    state: string,
    market: string,
    simple_name: string,
    name: string,
    tradeable: boolean,
    tradeability: string,
    symbol: string,
    bloomberg_unique: string,
    margin_initial_ratio: string,
    maintenance_ratio: string,
    country: string,
    day_trade_ratio: string,
    list_date: string,
    min_tick_size: number,
    type: string,
    tradeable_chain_id: string,
    rhs_tradeability: string,
    fractional_tradeability: string,
    default_collar_fraction: string
}