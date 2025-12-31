import path from 'path';

import pug from 'pug';
import { createTransport } from 'nodemailer';
import { BASE_DIR, ROOT_DIR } from '@configs/config.js';

const { GOOGLE_APP_PASSWORD, GOOGLE_USER, APP_NAME } = process.env;

export const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: GOOGLE_USER,
    pass: GOOGLE_APP_PASSWORD,
  },
});

type SendEmailOptions<RenderTemplateOptions = pug.Options & pug.LocalsObject> = {
  mail: {
    from?: string;
    to: string;
    subject: string;
  };

  render: {
    filename: string;
    options?: RenderTemplateOptions;
  };
};

export default function sendEmail({
  mail: { from, to, subject },
  render,
}: SendEmailOptions) {
  const filepath = path.join(
    BASE_DIR,
    'lib',
    'emails',
    'templates',
    `${render.filename}.pug`,
  );
  const renderedTemplate = pug.renderFile(filepath, render.options ?? {});

  transporter.sendMail({
    to,
    subject,
    from: from ?? `"${APP_NAME}" <${GOOGLE_USER}>`,
    html: renderedTemplate,
  });
}
