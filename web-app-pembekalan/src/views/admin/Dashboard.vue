<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-slate-500 font-medium">Total Mahasiswa</h3>
          <Users class="text-indigo-600" :size="24" />
        </div>
        <p class="text-3xl font-bold text-slate-900">{{ stats.totalStudents }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-slate-500 font-medium">Peserta Pembekalan</h3>
          <ClipboardList class="text-emerald-600" :size="24" />
        </div>
        <p class="text-3xl font-bold text-slate-900">{{ stats.totalParticipants }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-slate-500 font-medium">Mahasiswa Lulus</h3>
          <GraduationCap class="text-amber-600" :size="24" />
        </div>
        <p class="text-3xl font-bold text-slate-900">{{ stats.totalPassed }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-slate-500 font-medium">Pengumuman</h3>
          <Bell class="text-rose-600" :size="24" />
        </div>
        <p class="text-3xl font-bold text-slate-900">{{ stats.totalAnnouncements }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h3 class="text-lg font-bold mb-4">Aktivitas Terbaru</h3>
      <p class="text-slate-500">Selamat datang di panel administrasi Sistem Pendaftaran Pembekalan Mahasiswa.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Users, ClipboardList, GraduationCap, Bell } from 'lucide-vue-next';

const stats = ref({
  totalStudents: 0,
  totalParticipants: 0,
  totalPassed: 0,
  totalAnnouncements: 0
});

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    stats.value = response.data;
  } catch (err) {
    console.error('Failed to fetch stats', err);
  }
};

onMounted(fetchStats);
</script>
