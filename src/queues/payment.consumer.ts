/* eslint-disable @typescript-eslint/require-await */
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'

@Processor(PAYMENT_QUEUE_NAME)
export class PaymentConsumer extends WorkerHost {
  async process(job: Job<{ paymentId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        // console.log(CANCEL_PAYMENT_JOB_NAME, job.data)
        const { paymentId } = job.data
        return {}
      }
      default: {
        break
      }
    }
  }
}
