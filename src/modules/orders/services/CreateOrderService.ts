import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
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

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Customer does not exists');

    const productsQuery = await this.productsRepository.findAllById(products);

    const orderedProducts = products.map(product => {
      const [foundProduct] = productsQuery.filter(
        storedProduct => storedProduct.id === product.id,
      );

      if (!foundProduct) throw new AppError('Product does not exists');
      if (foundProduct.quantity < product.quantity)
        throw new AppError('Product with insuficient quantity');

      return {
        product_id: foundProduct.id,
        quantity: product.quantity,
        price: foundProduct.price,
      };
    });

    await this.productsRepository.updateQuantity(products);

    const order = this.ordersRepository.create({
      customer,
      products: orderedProducts,
    });

    return order;
  }
}

export default CreateProductService;
