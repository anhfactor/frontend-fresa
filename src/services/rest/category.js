import request from '../request';

const categoryService = {
  getChild: (params) =>
    request.get('dashboard/seller/categories/paginate/children', { params }),
  getAll: (params) => request.get('rest/categories/paginate', { params }),
  getById: (id, params) => request.get(`rest/categories/${id}`, { params }),
  search: (params) => request.get('rest/categories/parent', { params }),
};

export default categoryService;
