import { Router } from 'express';
import { PathParams } from 'express-serve-static-core';

export class RouteType {
    protected handle = Router();
    protected path: PathParams;

    constructor(path: PathParams) {
        this.path = path;
    }

    public Register(router: Router): void {
        router.use(this.path, this.handle);
    }
}