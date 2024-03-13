import request from './request';

const blogService = {
  getAll: (params) => request.get('dashboard/admin/blogs/paginate', { params }),
  getById: (id) => request.get(`dashboard/admin/blogs/${id}`),
  create: (data) => request.post('dashboard/admin/blogs', data),
  update: (id, data) => request.put(`dashboard/admin/blogs/${id}`, data),
  delete: (id) => request.delete(`dashboard/admin/blogs`, { data: id }),
  setActive: (id) => request.post(`dashboard/admin/blogs/${id}/active/status`),
  publish: (id) => request.post(`dashboard/admin/blogs/${id}/publish`),
};

export default blogService;
