interface Historical {
    begins_at: string;
    open_price: string;
    close_price: string;
    high_price: string;
    low_price: string;
    volume: number;
    session: 'pre' | 'reg' | 'post';
    interpolated: boolean;
}

// See how robinhood updates/adds the open_price
export default class Instrument {
    public information: any;
    public historicals: Array<Historical>;

    constructor(information: any) {
        this.information = information;
    }
}