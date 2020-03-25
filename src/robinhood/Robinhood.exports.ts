export const ROBINHOOD_HOST = "api.robinhood.com";
export type RobinhoodUserStatus = 'no-auth' | 'challenge-type' | 'challenge-issued' | 'authenticated' | 'error';
export type ReturnEnvelope = {message: string, status: RobinhoodUserStatus, data: any};