import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorator/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { PaymentApiKeyGuard } from './payment-api-key.guard'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  //   private readonly authTypeGuardMap: Record<string, CanActivate> = {
  //     [AuthType.Bearer]: this.accessTokenGuard,
  //     [AuthType.ApiKey]: this.apiKeyGuard,
  //     [AuthType.None]: { canActivate: () => true },
  //   }
  //   constructor(
  //     private readonly reflector: Reflector,
  //     private readonly accessTokenGuard: AccessTokenGuard,
  //     private readonly apiKeyGuard: ApiKeyGuard,
  //   ) {}

  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly paymentApiKeyGuard: PaymentApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.PaymentApiKey]: this.paymentApiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // console.log('AuthenticationGuard')
    const authTypeValue = this.getAuthTypeValue(context)

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])
    // console.log(guards)

    return authTypeValue.options?.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context)
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }
    return authTypeValue
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: any = null

    // Loop through all guards, if one guard pass, return true
    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) return true
      } catch (error) {
        lastError = error
      }
    }

    if (lastError instanceof HttpException) throw lastError

    throw new UnauthorizedException()
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    // Loop through aa all guards, if all guards pass, return tre
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new UnauthorizedException()
      }
    }
    return true
  }
}
