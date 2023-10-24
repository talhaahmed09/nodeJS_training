import * as amqp from "amqplib/callback_api";
import * as dotenv from "dotenv";

dotenv.config();

const rabbitMqUrl: string = process.env.RABBITMQ_URL || "amqp://localhost";
const queueName: string = process.env.QUEUE_NAME || "blog_comments";

export async function postCommentToQueue(comment: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const emailData = {
      subject: "New Comment Notification",
      text: comment.message,
      from: comment.sender,
    };
    console.log("hello forom service");
    amqp.connect(
      rabbitMqUrl,
      (connectionError: any, connection: amqp.Connection) => {
        if (connectionError) {
          throw connectionError;
        }
        connection.createChannel((channelError: any, channel: amqp.Channel) => {
          if (channelError) {
            throw channelError;
          }
          channel.assertQueue(queueName, { durable: false });

          console.log(
            "Waiting for messages in %s. To exit, press CTRL+C",
            queueName
          );

          channel.sendToQueue(queueName, Buffer.from(emailData.text), {
            persistent: true,
          });
          console.log(
            `Sent: ${emailData.subject} ${emailData.from}  \n ${emailData.text}`
          );
        });
        setTimeout(() => {
          connection.close();
        }, 500);
      }
    );
  });
}
