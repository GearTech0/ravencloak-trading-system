import express from 'express';
import ChallengeRoute from './api/Challenge.route';
let router = express.Router();

const challengeRoute: ChallengeRoute = new ChallengeRoute('/challenge');

challengeRoute.Register(router);

export default router;