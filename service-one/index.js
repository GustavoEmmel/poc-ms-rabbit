const amqp = require("amqplib");
const exampleController = require("./exampleController");

const serviceName = "service-one";

// Map to dynamically resolve controllers by name
const controllers = {
  exampleController,
};

/**
 * Start the RabbitMQ service for handling incoming requests.
 * Routes requests to the appropriate controller and action.
 */
async function startService() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queueName = `${serviceName}`;
  await channel.assertQueue(queueName);

  // Consume messages from the queue
  channel.consume(queueName, async (msg) => {
    const { replyTo, correlationId } = msg.properties;
    const { controllerName, actionName, params } = JSON.parse(msg.content.toString());

    let response;
    try {
      // Dynamically call the appropriate controller action
      const controller = controllers[controllerName];
      const action = controller?.[actionName];
      if (!action)
        throw new Error(`Action "${actionName}" not found in controller "${controllerName}"`);

      response = await action(...params);
    } catch (error) {
      response = { error: error.message };
    }

    // Respond to RPC requests via the reply queue
    if (replyTo) {
      channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
  });
}

startService().then(() => console.log("Service One is running"));
