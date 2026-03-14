<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col">
      <div class="p-6 border-b border-slate-800">
        <h2 class="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/admin" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin' }">
          <LayoutDashboard :size="20" />
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin/activities" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin/activities' }">
          <Calendar :size="20" />
          <span>Kelola Pembekalan</span>
        </router-link>
        <router-link to="/admin/participants" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin/participants' }">
          <Users :size="20" />
          <span>Data Peserta</span>
        </router-link>
        <router-link to="/admin/evaluation" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin/evaluation' }">
          <FileText :size="20" />
          <span>Evaluasi Akademik</span>
        </router-link>
        <router-link to="/admin/announcements" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin/announcements' }">
          <Bell :size="20" />
          <span>Kelola Pengumuman</span>
        </router-link>
        <router-link to="/admin/certificates" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/admin/certificates' }">
          <Award :size="20" />
          <span>Kelola Sertifikat</span>
        </router-link>
      </nav>
      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg hover:bg-red-600/20 text-red-400 transition-colors">
          <LogOut :size="20" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <header class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-slate-800">{{ pageTitle }}</h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-slate-500">Welcome, Admin</span>
          <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">A</div>
        </div>
      </header>
      <div class="p-8">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LayoutDashboard, Calendar, Users, LogOut, Bell, Award, FileText } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const pageTitle = computed(() => {
  if (route.path === '/admin') return 'Dashboard Overview';
  if (route.path === '/admin/activities') return 'Manajemen Kegiatan';
  if (route.path === '/admin/participants') return 'Data Peserta';
  if (route.path === '/admin/evaluation') return 'Evaluasi Akademik';
  return 'Admin';
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>
