import request from '../request';

const paymentService = {
  getAll: (params) => request.get('rest/payments', { params }),
  getById: (id) => request.get(`rest/shop-payments/${id}`),
  getId: (id) => request.get(`rest/payments?shop_id=${id}`),
};

export default paymentService;
