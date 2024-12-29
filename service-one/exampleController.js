const exampleController = {
  async getByIdAction(id) {
    // Simulate fetching a resource by ID
    return { message: `Service One: Fetched item with ID ${id}`, item: { id, name: "Item One" } };
  },
  async getAllAction(params) {
    // Simulate fetching all resources with optional filters
    return {
      message: "Service One: Fetched all items",
      query: params,
      items: [{ id: 1, name: "Item One" }],
    };
  },
  async postAction(params) {
    // Simulate creating a new resource
    return { message: "Service One: Created a new item", createdItem: { id: 1, ...params } };
  },
  async putAction(id, params) {
    // Simulate updating a resource by ID
    return { message: `Service One: Updated item with ID ${id}`, updatedItem: { id, ...params } };
  },
  async deleteAction(id) {
    // Simulate deleting a resource by ID
    return { message: `Service One: Deleted item with ID ${id}` };
  },
};

module.exports = exampleController;
