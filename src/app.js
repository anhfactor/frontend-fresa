import Loading from 'components/loading';
import PageLoading from 'components/pageLoading';
import i18n from 'configs/i18next';
import { PathLogout } from 'context/path-logout';
import { ProtectedRoute } from 'context/protected-route';
import AppLayout from 'layout/app-layout';
import { WelcomeLayout } from 'layout/welcome-layout';
import Providers from 'providers';
import { Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { fetchRestSettings, fetchSettings } from 'redux/slices/globalSettings';
import { AllRoutes } from 'router/routes';
import informationService from 'services/rest/information';
import GlobalSettings from 'views/global-settings/global-settings';
import Login from 'views/login/login';
import NotFound from 'views/not-found';
import Welcome from 'views/welcome/welcome';

const App = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  function fetchTranslations() {
    const params = { lang: i18n.language };
    setLoading(true);
    informationService
      .translations(params)
      .then(({ data }) =>
        i18n.addResourceBundle(i18n.language, 'translation', data)
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTranslations();
    if (user?.role === 'admin') {
      dispatch(fetchSettings());
    } else {
      dispatch(fetchRestSettings());
    }
  }, []);

  return (
    <Providers>
      <Router>
        <Routes>
          <Route
            index
            path='/login'
            element={
              <PathLogout>
                <Login />
              </PathLogout>
            }
          />
          <Route
            path='/welcome'
            element={
              <WelcomeLayout>
                <Welcome />
              </WelcomeLayout>
            }
          />
          <Route
            path='/installation'
            element={
              <WelcomeLayout>
                <GlobalSettings />
              </WelcomeLayout>
            }
          />
          <Route
            path=''
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path='/' element={<Navigate to='dashboard' />} />
            {AllRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
          <Route
            path='*'
            element={
              <Suspense fallback={<Loading />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
        <ToastContainer
          className='antd-toast'
          position='top-right'
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
        />
        {loading && <PageLoading />}
      </Router>
    </Providers>
  );
};
export default App;
