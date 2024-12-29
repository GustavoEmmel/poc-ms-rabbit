const express = require("express");
const { sendRPC } = require("../lib/rabbitmq-helper");

const app = express();
app.use(express.json());

/**
 * Route handler for API Gateway
 * Dynamically determines the service, controller, and action to call based on the request URL and HTTP verb.
 */
app.all("/api/:serviceName/:controllerName/*", async (req, res) => {
  const { serviceName, controllerName } = req.params;
  const { method, body, query } = req;

  // Map HTTP verbs to controller actions
  const actionMap = {
    GET: req.params[0] ? "getByIdAction" : "getAllAction",
    POST: "postAction",
    PUT: "putAction",
    DELETE: "deleteAction",
  };

  const action = actionMap[method];
  if (!action) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const params =
    action === "getByIdAction" || action === "putAction" || action === "deleteAction"
      ? [req.params[0], body] // Extract ID from the wildcard path
      : [body || query];

  try {
    const response = await sendRPC(serviceName, controllerName, action, params);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));
