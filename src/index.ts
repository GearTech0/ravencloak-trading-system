import * as fs from 'fs';
import path from 'path';
import app from './config/Express.config';
import { Robinhood } from './robinhood/Robinhood.api';
import { ReturnEnvelope } from './robinhood/Robinhood.exports';

const secure_info = fs.readFileSync(path.join(__dirname, '/security/secure.json')).toString();
const parsedSecureInfo = JSON.parse(secure_info);

app.listen(3000, () => {
    console.log('Connected and listening on port 3000');
});