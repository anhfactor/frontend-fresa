import request from './request';

const brandService = {
  get: (params) => request.get('dashboard/admin/brands', { params }),
  getAll: (params) =>
    request.get('dashboard/admin/brands/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/brands/${id}`, { params }),
  create: (params) => request.post('dashboard/admin/brands', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/brands/${id}`, {}, { params }),
  delete: (id) => request.delete(`dashboard/admin/brands`, { data: id }),
  search: (search = '') =>
    request.get(`dashboard/admin/brands/search?search=${search}`),
  export: () => request.get(`dashboard/admin/brands/export`),
  import: (data) => request.post('dashboard/admin/brands/import', data, {}),
};

export default brandService;
