import request from '../request';

const brandService = {
  getAll: (params) => request.get('rest/brands/paginate', { params }),
  getById: (id, params) => request.get(`rest/brands/${id}`, { params }),
  search: (params) => request.get('rest/brands/paginate', { params }),
};

export default brandService;
