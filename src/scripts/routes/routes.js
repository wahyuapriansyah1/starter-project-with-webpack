import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
const homePageInstance = new HomePage();
const aboutPageInstance = new AboutPage();

const routes = {
  '/': homePageInstance,
  '/tambah': () => import('../pages/add/add-page'),
  '/login': () => import('../pages/auth/auth-page'),
  '/about': aboutPageInstance,
};

export default routes;
