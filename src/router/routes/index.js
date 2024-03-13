// ** Routes Imports
import { AdminRoutes } from './admin';
import { SellerRoutes } from './seller';

// ** Merge Routes
const AllRoutes = [...AdminRoutes, ...SellerRoutes];

export { AllRoutes };
