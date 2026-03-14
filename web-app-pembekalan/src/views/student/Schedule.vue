<template>
  <div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">Kegiatan</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Tanggal & Waktu</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Lokasi</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Kehadiran</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Status</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="reg in registrations" :key="reg.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ reg.activity_name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-slate-900 text-sm">{{ formatDate(reg.date) }}</div>
              <div class="text-slate-500 text-xs">{{ formatTime(reg.time) }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600 text-sm">{{ reg.location }}</td>
            <td class="px-6 py-4">
              <span :class="reg.attendance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'" class="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider">
                {{ reg.attendance ? 'Hadir' : 'Belum Absen' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span :class="{
                  'text-emerald-600': reg.status === 'Lulus',
                  'text-red-600': reg.status === 'Tidak Lulus',
                  'text-amber-600': reg.status === 'Belum Lulus'
                }" class="text-xs font-bold">
                  {{ reg.status }}
                </span>
                <div v-if="reg.score !== null" class="flex items-center space-x-2 mt-1">
                  <span class="text-[10px] text-slate-500">Nilai: {{ reg.score }}</span>
                  <span class="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600">Grade: {{ calculateGrade(reg.score) }}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col space-y-2">
                <span class="text-indigo-600 font-medium text-sm">Terdaftar</span>
                <template v-if="reg.material_url">
                  <a v-if="reg.attendance" :href="reg.material_url" target="_blank" class="flex items-center space-x-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 transition-colors w-fit">
                    <Download :size="14" />
                    <span>Materi</span>
                  </a>
                  <span v-else class="text-[10px] text-slate-400 italic">Materi tersedia setelah absen</span>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="registrations.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-slate-500">Anda belum memiliki jadwal kegiatan.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Download } from 'lucide-vue-next';

const registrations = ref<any[]>([]);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
    return `${hours}:${minutes}:${seconds}`;
  }
  return timeStr;
};

const calculateGrade = (score: number) => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
};

const fetchRegistrations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/student/my-registrations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    registrations.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchRegistrations);
</script>
