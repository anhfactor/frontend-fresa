import request from './request';

const recipeCategoryService = {
  getAll: (params) =>
    request.get('dashboard/admin/recipe-category', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/recipe-category/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/recipe-category', data),
  update: (id, data) =>
    request.put(`dashboard/admin/recipe-category/${id}`, data),
  delete: (id) =>
    request.delete(`dashboard/admin/recipe-category`, { data: id }),
  setActive: (id) =>
    request.post(`dashboard/admin/recipe-category/status/${id}`),
};

export default recipeCategoryService;
