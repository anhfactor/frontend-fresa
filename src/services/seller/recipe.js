import request from '../request';

const recipeService = {
  getAll: (params) => request.get('dashboard/seller/recipe', { params }),
  getAllCategories: (params) =>
    request.get('dashboard/seller/recipe-category', { params }),
  getById: (id) => request.get(`dashboard/seller/recipe/${id}`),
  create: (data) => request.post('dashboard/seller/recipe', data),
  update: (id, data) => request.put(`dashboard/seller/recipe/${id}`, data),
  delete: (id) => request.delete(`dashboard/seller/recipe`, { data: id }),
  setActive: (id) => request.post(`dashboard/seller/recipe/status/${id}`),
};

export default recipeService;
