import { inject, injectable } from 'tsyringe';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  private ordersRepository: IOrdersRepository;

  private productsRepository: IProductsRepository;

  private customersRepository: ICustomersRepository;

  constructor(
    @inject('OrdersRepository')
    ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    customersRepository: ICustomersRepository,
  ) {
    this.ordersRepository = ordersRepository;
    this.productsRepository = productsRepository;
    this.customersRepository = customersRepository;
  }

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    const order = await this.ordersRepository.findById(id);

    return order;
  }
}

export default FindOrderService;
