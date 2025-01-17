const { sendRPC, sendAsync } = require("../lib/rabbitmq-helper");

const anotherController = {
  async getByIdAction(id) {
    // Simulate fetching a resource by ID

    // use sendRPC to call another service and await for the response
    const serviceOneResponse = await sendRPC("service-one", "exampleController", "getByIdAction", [
      1,
    ]);

    console.log("serviceOneResponse", serviceOneResponse);
    return { message: `Service Two: Fetched item with ID ${id}`, item: { id, name: "Item Two" } };
  },
  async getAllAction(params) {
    // Simulate fetching all resources with optional filters
    return {
      message: "Service Two: Fetched all items",
      query: params,
      items: [{ id: 2, name: "Item Two" }],
    };
  },
  async postAction(params) {
    // Simulate creating a new resource

    // use sendAsync to call another service without waiting for the response
    sendAsync("service-one", "exampleController", "postAction", [{ name: "Item Two" }]);
    return { message: "Service Two: Created a new item", createdItem: { id: 2, ...params } };
  },
  async putAction(id, params) {
    // Simulate updating a resource by ID
    return { message: `Service Two: Updated item with ID ${id}`, updatedItem: { id, ...params } };
  },
  async deleteAction(id) {
    // Simulate deleting a resource by ID
    return { message: `Service Two: Deleted item with ID ${id}` };
  },
};

module.exports = anotherController;
