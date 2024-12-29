const amqp = require("amqplib");
const anotherController = require("./anotherController");

const serviceName = "service-two";

// Map to dynamically resolve controllers by name
const controllers = {
  anotherController,
};

async function startService() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = `${serviceName}`;
  await channel.assertQueue(queueName);

  channel.consume(queueName, async (msg) => {
    const { replyTo, correlationId } = msg.properties;
    const { controllerName, actionName, params } = JSON.parse(msg.content.toString());

    let response;
    try {
      const controller = controllers[controllerName];
      const action = controller?.[actionName];
      if (!action)
        throw new Error(`Action "${actionName}" not found in controller "${controllerName}"`);

      response = await action(...params);
    } catch (error) {
      response = { error: error.message };
    }

    if (replyTo) {
      channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
  });
}

startService().then(() => console.log("Service Two is running"));
