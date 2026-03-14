<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-indigo-900 text-white flex flex-col">
      <div class="p-6 border-b border-indigo-800">
        <h2 class="text-xl font-bold">Mahasiswa</h2>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/student" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/student' }">
          <LayoutDashboard :size="20" />
          <span>Dashboard</span>
        </router-link>
        <router-link to="/student/registration" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/student/registration' }">
          <ClipboardList :size="20" />
          <span>Pendaftaran</span>
        </router-link>
        <router-link to="/student/schedule" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/student/schedule' }">
          <Calendar :size="20" />
          <span>Jadwal Saya</span>
        </router-link>
        <router-link to="/student/status" class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-600': $route.path === '/student/status' }">
          <GraduationCap :size="20" />
          <span>Status Kelulusan</span>
        </router-link>
      </nav>
      <div class="p-4 border-t border-indigo-800">
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
          <span class="text-sm text-slate-500">Halo, {{ user.name }}</span>
          <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            {{ user.name?.charAt(0) }}
          </div>
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
import { LayoutDashboard, ClipboardList, Calendar, GraduationCap, LogOut } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const user = JSON.parse(localStorage.getItem('user') || '{}');

const pageTitle = computed(() => {
  if (route.path === '/student') return 'Dashboard Mahasiswa';
  if (route.path === '/student/registration') return 'Pendaftaran Pembekalan';
  if (route.path === '/student/schedule') return 'Jadwal Pembekalan';
  if (route.path === '/student/status') return 'Status & Sertifikat';
  return 'Mahasiswa';
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>
