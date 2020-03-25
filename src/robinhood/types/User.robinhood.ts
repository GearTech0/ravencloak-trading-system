import { v4 } from 'uuid';
import fs from 'fs';

const USER_CACHE = './security/user.cache.json';

export default class RobinhoodUser {
    public username: string;
    public deviceID: string = v4();
    public token: object = null;

    constructor() {}

    public cache(): string {
        return JSON.stringify(this);
    }
}