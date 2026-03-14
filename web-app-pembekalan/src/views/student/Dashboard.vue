<template>
  <div class="space-y-8">
    <!-- Info Card -->
    <div class="py-2">
      <h2 class="text-3xl font-bold text-slate-900 mb-2">Selamat Datang, {{ profile.name }}!</h2>
      <p class="text-slate-600 max-w-2xl">
        Pantau status pendaftaran pembekalan dan jadwal kegiatan Anda di sini. Pastikan untuk mengikuti seluruh rangkaian kegiatan untuk mendapatkan sertifikat kelulusan.
      </p>
    </div>

    <div class="space-y-8">
      <!-- Status Summary -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold flex items-center space-x-2">
            <Info :size="20" class="text-indigo-600" />
            <span>Hasil Evaluasi Akademik</span>
          </h3>
          <router-link to="/student/registration" class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Daftar Kegiatan Baru
          </router-link>
        </div>

        <div v-if="evaluation" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="py-4 px-2 font-semibold text-slate-700 text-sm">Keterangan</th>
                <th class="py-4 px-2 font-semibold text-slate-700 text-sm text-center">Kehadiran</th>
                <th class="py-4 px-2 font-semibold text-slate-700 text-sm text-center">Nilai Ujian</th>
                <th class="py-4 px-2 font-semibold text-slate-700 text-sm text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-2">
                  <p class="font-medium text-slate-900 text-sm">Evaluasi Akademik Pembekalan</p>
                  <p class="text-[10px] text-slate-500 mt-1">Akumulasi seluruh kegiatan</p>
                </td>
                <td class="py-4 px-2 text-center">
                  <span :class="calculateAttendancePercentage(evaluation.hadir_count) >= 80 ? 'text-emerald-600' : 'text-amber-600'" class="text-xs font-bold">
                    {{ calculateAttendancePercentage(evaluation.hadir_count) }}%
                  </span>
                </td>
                <td class="py-4 px-2 text-center text-xs font-bold text-slate-700">
                  {{ evaluation.score ?? 0 }}
                </td>
                <td class="py-4 px-2 text-center">
                  <span :class="{
                    'bg-emerald-100 text-emerald-700': evaluation.status === 'Lulus',
                    'bg-red-100 text-red-700': evaluation.status === 'Mengulang',
                    'bg-amber-100 text-amber-700': evaluation.status === 'Belum Lulus'
                  }" class="px-2 py-1 rounded-full text-[10px] font-semibold uppercase">
                    {{ evaluation.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-12 text-slate-500">
          <p>Belum ada data evaluasi. Pastikan Anda sudah mendaftar kegiatan.</p>
          <router-link to="/student/registration" class="text-indigo-600 font-medium hover:underline mt-2 inline-block">Daftar Sekarang</router-link>
        </div>
      </div>

      <!-- Announcements -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 class="text-lg font-bold mb-6 flex items-center space-x-2">
          <Bell :size="20" class="text-indigo-600" />
          <span>Pengumuman Terbaru</span>
        </h3>
        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div v-for="ann in announcements" :key="ann.id" class="p-4 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-xl">
            <p class="text-sm font-bold text-slate-900">{{ ann.title }}</p>
            <p class="text-[10px] text-slate-500 mb-2">{{ formatDate(ann.created_at) }} {{ formatTime(ann.created_at) }}</p>
            <p class="text-xs text-slate-600 whitespace-pre-wrap">{{ ann.content }}</p>
          </div>
          <div v-if="announcements.length === 0" class="text-center py-8 text-slate-500 text-sm italic">
            Belum ada pengumuman.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { GraduationCap, Info, Bell, Download, Edit3, Trash2 } from 'lucide-vue-next';

const profile = ref<any>({});
const evaluation = ref<any>(null);
const announcements = ref<any[]>([]);
const activities = ref<any[]>([]);

const TOTAL_SESSIONS = 9;

const calculateAttendancePercentage = (hadirCount: number) => {
  if (!hadirCount) return 0;
  return Math.round((hadirCount / TOTAL_SESSIONS) * 100);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const [profileRes, evalRes, annRes, actRes] = await Promise.all([
      axios.get('/api/student/profile', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/student/my-evaluation', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/student/announcements', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/student/activities', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    profile.value = profileRes.data;
    evaluation.value = evalRes.data;
    announcements.value = annRes.data;
    activities.value = actRes.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchData);
</script>
