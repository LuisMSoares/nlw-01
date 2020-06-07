import express from 'express';

import Items_Controller from './controllers/Items_Controller'
import Points_Controller from './controllers/Points_Controller';


const routes = express.Router();

const items_controller = new Items_Controller();
const points_Controller = new Points_Controller();


routes.get('/items', items_controller.index);

routes.post('/points', points_Controller.create);
routes.get('/points', points_Controller.index);
routes.get('/points/:id', points_Controller.show);


export default routes;