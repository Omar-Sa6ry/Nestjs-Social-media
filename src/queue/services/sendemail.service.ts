import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Injectable()
export class SendEmailService {
  constructor (@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendEmail (to: string, subject: string, text: string) {
    await this.emailQueue.add({
      to,
      subject,
      text,
    })
  }
}
