import express from 'express';
export interface RouteType {
    Register(router: express.Router): void;
}