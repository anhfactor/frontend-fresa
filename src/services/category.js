import request from './request';

const categoryService = {
  getAll: (params) =>
    request.get('dashboard/admin/categories/paginate', { params }),
  selectCategory: (params) =>
    request.get('dashboard/admin/categories/select-paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/categories/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/categories', data, {}),
  update: (id, data) =>
    request.put(`dashboard/admin/categories/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/admin/categories`, { data: id }),
  search: (params) =>
    request.get('dashboard/admin/categories/search', { params }),
  setActive: (id) => request.post(`dashboard/admin/categories/active/${id}`),
  export: () => request.get(`dashboard/admin/categories/export`),
  import: (data) => request.post('dashboard/admin/categories/import', data, {}),
};

export default categoryService;
