import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import AdminActivities from '../views/admin/Activities.vue';
import AdminParticipants from '../views/admin/Participants.vue';
import AdminAcademicEvaluation from '../views/admin/AcademicEvaluation.vue';
import AdminAnnouncements from '../views/admin/Announcements.vue';
import AdminCertificates from '../views/admin/Certificates.vue';
import StudentDashboard from '../views/student/Dashboard.vue';
import StudentRegistration from '../views/student/Registration.vue';
import StudentSchedule from '../views/student/Schedule.vue';
import StudentStatus from '../views/student/Status.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      { path: '', component: AdminDashboard },
      { path: 'activities', component: AdminActivities },
      { path: 'participants', component: AdminParticipants },
      { path: 'evaluation', component: AdminAcademicEvaluation },
      { path: 'announcements', component: AdminAnnouncements },
      { path: 'certificates', component: AdminCertificates },
    ]
  },
  {
    path: '/student',
    component: () => import('../layouts/StudentLayout.vue'),
    children: [
      { path: '', component: StudentDashboard },
      { path: 'registration', component: StudentRegistration },
      { path: 'schedule', component: StudentSchedule },
      { path: 'status', component: StudentStatus },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (to.path.startsWith('/admin') && user.role !== 'admin') {
    return next('/login');
  }
  if (to.path.startsWith('/student') && user.role !== 'mahasiswa') {
    return next('/login');
  }
  next();
});

export default router;
