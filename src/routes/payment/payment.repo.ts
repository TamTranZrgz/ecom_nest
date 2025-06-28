import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { WebhookPaymentBodyType } from './payment.model'
import { MessageResType } from 'src/shared/models/response.model'
import { parse } from 'date-fns'
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant'
import { OrderIncludeProductSKUSnapshotType } from 'src/shared/models/shared-order.model'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { OrderStatus } from 'src/shared/constants/order.constant'

@Injectable()
export class PaymentRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.skuPrice * productSku.quantity
      }, 0)
      return total + orderTotal
    }, 0)
  }

  async receiver(body: WebhookPaymentBodyType): Promise<MessageResType> {
    // 1. Add transaction info to db
    let amountIn = 0
    let amountOut = 0

    if (body.transferType === 'in') {
      amountIn = body.transferAmount
    } else {
      amountOut = body.transferAmount
    }

    await this.prismaService.paymentTransaction.create({
      data: {
        gateway: body.gateway,
        transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
        accountNumber: body.accountNumber,
        subAccount: body.subAccount,
        amountIn,
        amountOut,
        accumulated: body.accumulated,
        code: body.code,
        transactionContent: body.content,
        referenceNumber: body.referenceCode,
        body: JSON.stringify(body),
      },
    })

    // 2. Check transaction content and whether total amount is valid
    const paymentId = body.code
      ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1])

    if (isNaN(paymentId)) {
      throw new BadRequestException('Cannot get payment id from content')
    }

    const payment = await this.prismaService.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      throw new BadRequestException(`Can not get payment with id ${paymentId}`)
    }

    const { orders } = payment
    const totalPrice = this.getTotalPrice(orders)

    if (totalPrice !== body.transferAmount) {
      throw new BadRequestException(`Total price does not match, expected ${totalPrice} but got ${body.transferAmount}`)
    }

    // 3. Update payment status and order status
    await this.prismaService.$transaction([
      this.prismaService.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.SUCCESS,
        },
      }),
      this.prismaService.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
        },
        data: {
          status: OrderStatus.PENDING_PICKUP,
        },
      }),
    ])

    return { message: 'Payment success' }
  }
}
