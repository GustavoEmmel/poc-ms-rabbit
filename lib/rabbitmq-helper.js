const amqp = require("amqplib");

const rabbitUrl = "amqp://localhost"; // RabbitMQ URL

/**
 * Sends a synchronous RPC request to a service.
 * Creates a temporary reply queue for receiving the response.
 *
 * @param {string} serviceName - Name of the target service.
 * @param {string} controllerName - Name of the target controller.
 * @param {string} actionName - Name of the action to perform.
 * @param {Object} params - Parameters for the request.
 * @returns {Promise<Object>} - The response from the service.
 */
async function sendRPC(serviceName, controllerName, actionName, params) {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  const queueName = `${serviceName}`;
  const replyQueue = await channel.assertQueue("", { exclusive: true });

  const correlationId = Math.random().toString();

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify({ controllerName, actionName, params })),
    {
      correlationId,
      replyTo: replyQueue.queue,
    }
  );

  return new Promise((resolve, reject) => {
    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
          channel.close();
          connection.close();
        }
      },
      { noAck: true }
    );
  });
}

/**
 * Sends an asynchronous request to a service.
 * The service processes the request without responding back.
 *
 * @param {string} serviceName - Name of the target service.
 * @param {string} controllerName - Name of the target controller.
 * @param {string} actionName - Name of the action to perform.
 * @param {Object} params - Parameters for the request.
 */
async function sendAsync(serviceName, controllerName, actionName, params) {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  const queueName = `${serviceName}`;
  await channel.assertQueue(queueName);

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify({ controllerName, actionName, params }))
  );
  await channel.close();
  await connection.close();
}

module.exports = {
  sendRPC,
  sendAsync,
};
