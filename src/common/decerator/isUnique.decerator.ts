import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'


@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor (private readonly dataSource: DataSource) {
    console.log(dataSource)
  }

  async validate (value: any, args: ValidationArguments): Promise<boolean> {
    const [EntityClass, field] = args.constraints
    console.log(this.dataSource)

    const repository = this.dataSource.getRepository(EntityClass)

    const record = await repository.findOne({
      where: { [field]: value },
    })

    return !record
  }

  defaultMessage (args: ValidationArguments): string {
    const [_, field] = args.constraints
    return `${field} already exists.`
  }
}

export function IsUnique (
  EntityClass: any,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [EntityClass, field],
      validator: IsUniqueConstraint,
    })
  }
}
