import request from './request';

const groupService = {
  getAll: (params) => request.get('dashboard/admin/groups', { params }),
  getActive: () => request.get('rest/groups'),
  getById: (uuid) => request.get(`dashboard/admin/groups/${uuid}`),
  create: (data) => request.post('dashboard/admin/groups', data),
  update: (uuid, data) => request.put(`dashboard/admin/groups/${uuid}`, data),
  delete: (ids) => request.delete(`dashboard/admin/groups`, { data: ids }),
  setActive: (uuid) => request.post(`dashboard/admin/groups/active/${uuid}`),
};

export default groupService;
