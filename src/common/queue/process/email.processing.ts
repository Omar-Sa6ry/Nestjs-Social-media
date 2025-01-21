import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import * as nodemailer from 'nodemailer'

@Processor('email')
export class EmailProcessor {
  private transporter

  constructor () {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  }

  @Process()
  async sendEmail (job: Job) {
    const { to, subject, text } = job.data

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
      })
      console.log('Message sent: %s', info.messageId)
    } catch (error) {
      console.error('Error sending email:', error.message)
      throw error
    }
  }
}
