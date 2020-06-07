import { Request, Response} from 'express';
import knex from '../database/connections';


class Items_Controller {
  async index(req: Request, res: Response) {
    const items = await knex('items').select('*');
  
    const seriallized_items = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_name: item.image
      };
    });

    return res.json(seriallized_items);
  }
}

export default Items_Controller;