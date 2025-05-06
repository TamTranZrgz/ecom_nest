import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common'

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.UserAlreadyExists',
    path: 'email',
  },
])

export const CannotUpdateAdminUserException = new ForbiddenException('Error.CannotUpdateAdminUser')

export const CannotDeleteAdminUserException = new ForbiddenException('Error.CannotDeleteAdminUser')

// Only Admin can name role as ADMIN
export const CannotSetAdminRoleToUserException = new ForbiddenException('Error.CannotSetAdminRoleToUser')

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.RoleNotFound',
    path: 'role',
  },
])

// Can not delete or update your own profile
export const CannotUpdateOrDeleteYourselfException = new ForbiddenException('Error.CannotUpdateOrDeleteYourself')
