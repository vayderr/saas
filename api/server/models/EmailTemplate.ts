import Handlebars from 'handlebars';
import * as mongoose from 'mongoose';

interface IEmailTemplateDocument extends mongoose.Document {
  name: string;
  subject: string;
  message: string;
}

const EmailTemplate = mongoose.model<IEmailTemplateDocument>(
  'EmailTemplate',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  }),
);

async function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to SaaS by Async',
      message: `{{userName}},
        <p>
          Thanks for signing up on our <a href="https://github.com/async-labs/saas" target="blank">SaaS boilerplate</a>!
         <br/>
          Note that any data you save on the demo app will be deleted after 30 days.
        </p>
        <p>
          We used our SaaS boilerplate to build
          <a href="https://async-await.com" target="blank"> Async</a>,
           a communication and project management tool for small teams of software engineers.
        <br/>
          If you're learning how to build your own web app or SaaS product, check out our
          <a href="https://builderbook.org/book" target="blank"> book</a>.
        </p>
        <p>
          If you want to hire us to help you build a SaaS business, please apply using this
          <a href="https://goo.gl/forms/fnt6CkOOsaSUilIC3" target="blank"> form</a>.
        </p>
        Kelly & Timur, Team Async
      `,
    },
    {
      name: 'invitation',
      subject: 'You are invited to join a Team at async-await.com',
      message: `You've been invited to join <b>{{teamName}}</b>.
        <br/>Click here to accept the invitation: {{invitationURL}}
      `,
    },
  ];

  for (const t of templates) {
    if ((await EmailTemplate.countDocuments({ name: t.name })) === 0) {
      EmailTemplate.create(
        Object.assign({}, t, { message: t.message.replace(/\n/g, '').replace(/[ ]+/g, ' ') }),
      );
    }
  }
}

insertTemplates();

export default async function getEmailTemplate(name, params) {
  const source = await EmailTemplate.findOne({ name });
  if (!source) {
    throw new Error('not found');
  }

  return {
    message: Handlebars.compile(source.message)(params),
    subject: Handlebars.compile(source.subject)(params),
  };
}
