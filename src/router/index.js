import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import EmailVerify from '../views/EmailVerify.vue'
import DashboardView from '../views/Dashboard.vue'
import MyHomeView from '../views/HomeView.vue'
import CustomizeView from '../views/CustomizeView.vue'
import MenusView from '../views/MenusView.vue'
import CustomizeColors from '../views/CustomizeWebsiteColors.vue'
import SiteSettings from '../views/SiteSettings.vue'
import CustomizeWebsiteFonts from '../views/CustomizeWebsiteFonts.vue'
import CustomizeSocialLinks from '../views/CustomizeSocialLinks.vue'
import CustomizeRearrange from '../views/CustomizeRearrange.vue'
import RessetPassword from "@/components/forget_password/RessetPassword.vue";
import FrontLayout from "../views/layouts/Front.vue"
import DashboardLayout from "../views/layouts/Dashboard.vue"
import BlankLayout from "../views/layouts/Blank.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Public',
      component: FrontLayout,
      redirect: '/',
      children:[
        {
          path:'/',
          name: 'Home',
          component: MyHomeView
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login', layout:FrontLayout }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, title: 'Dashboard', layout:DashboardLayout }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/customize',
      name: 'customize',
      component: CustomizeView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: RessetPassword,
      meta: { title: 'Reset Password', layout:FrontLayout }

    },
    {
      path: '/customize/colors',
      name: 'customize_colors',
      component: CustomizeColors
    },
    {
      path: '/customize/components',
      name: 'customize_components',
      component: CustomizeView
    },
    {
      path: '/customize/fonts',
      name: 'customize_fonts',
      component: CustomizeWebsiteFonts
    },
    {
      path: '/customize/social-links',
      name: 'customize_social_links',
      component: CustomizeSocialLinks
    },
    {
      path: '/settings',
      name: 'site_settings',
      component: SiteSettings
    },
    {
      path: '/email/verify',
      name: 'email_verify',
      component: EmailVerify,
      meta: { title: 'Email verify' }
    },
    {
      path: '/home',
      name: 'homePage',
      component: MyHomeView
    },
    {
      path: '/customize/menus',
      name: 'menusPage',
      component: MenusView
    },
    {
      path: '/customize/rearrange',
      name: 'rearrangePage',
      component: CustomizeRearrange
    },
  ]
});

router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title || 'SpeedySites';
  document.title = pageTitle;
  if (to.path === "/home" && isLoggedIn()) {
    next("/dashboard");
  } else if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isLoggedIn()) {
      next("/");
    } else {
      next();
    }
  } else {
    next();
  }
});

function isLoggedIn() {
  return localStorage.getItem('access_token') !== null && !undefined;
}

export default router;