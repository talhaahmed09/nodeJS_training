import * as amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
const queueName = process.env.QUEUE_NAME || "blog_comments";

async function consumeQueue() {
  try {
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);

    console.log(
      `[*] Waiting for messages in ${queueName}. To exit, press CTRL+C`
    );

    channel.consume(
      queueName,
      (msg) => {
        if (msg !== null) {
          const comment = msg.content.toString();
          console.log(`[x] Received: ${comment}`);

          // Process the comment and send the email notification here

          channel.ack(msg);
        } else {
          console.log("No Comment found");
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error(error);
  }
}

consumeQueue();
