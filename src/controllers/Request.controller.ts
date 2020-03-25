import https from 'https';
import qs from 'querystring';
import { Observable, Observer } from 'rxjs';

class RequestController {
    private requestOptions: https.RequestOptions = {
        protocol: 'https:',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    constructor() {

    }

    private URLToOptions(url: string, queryParams?: qs.ParsedUrlQuery): https.RequestOptions {
        const requestURL = new URL(url);
        return (<https.RequestOptions> {
            hostname: requestURL.hostname,
            path: requestURL.pathname + ((queryParams) ? qs.stringify(queryParams) : ''),
        });
    }

    private request(method: string, body?: any, httpOptions?: https.RequestOptions): Observable<string> {
        return new Observable((obs: Observer<string>) => {
            this.requestOptions.method = method;
            const options = {...this.requestOptions, ...httpOptions};
            const req = https.request(options);
            
            // If there is a body, append it to the request
            if (body) {
                req.write(body);
            }

            req.end();

            req.on('response', (res) => {
                var responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('error', (err) => {
                    obs.error(err);
                });
                res.on('end', () => {
                    obs.next(responseData);
                    obs.complete();
                });
            });

            req.on('error', (err) => {
                obs.error(err);
            })
        });
    }

    public get(url: string, queryParams?: qs.ParsedUrlQuery, httpOptions?: https.RequestOptions): Observable<string> {
        return this.request('GET', null, {...httpOptions, ...this.URLToOptions(url, queryParams)});
    }

    public post(url: string, queryParams?: qs.ParsedUrlQuery, body?: any, httpOptions?: https.RequestOptions): Observable<string> {
        return this.request('POST', JSON.stringify(body), {...httpOptions, ...this.URLToOptions(url, queryParams)});
    }
}

const requestController = new RequestController();

export { requestController as RequestController }