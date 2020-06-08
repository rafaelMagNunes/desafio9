import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  private customerRepository: ICustomersRepository;

  constructor(
    @inject('CustomersRepository')
    customersRepository: ICustomersRepository,
  ) {
    this.customerRepository = customersRepository;
  }

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const userExists = await this.customerRepository.findByEmail(email);

    if (userExists) throw new AppError('User already exists');

    const user = await this.customerRepository.create({ name, email });

    return user;
  }
}

export default CreateCustomerService;
