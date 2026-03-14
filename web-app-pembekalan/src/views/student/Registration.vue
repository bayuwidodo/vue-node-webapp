<template>
  <div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">No</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Kegiatan</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Jadwal</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Lokasi</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Pendaftaran</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(activity, index) in activities" :key="activity.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 text-slate-500 font-medium">{{ index + 1 }}</td>
            <td class="px-6 py-4">
              <div class="font-bold text-slate-900">{{ activity.name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center text-sm text-slate-600 mb-1">
                <Calendar :size="14" class="mr-2 text-indigo-500" />
                {{ activity.date }}
              </div>
              <div class="flex items-center text-xs text-slate-500">
                <Clock :size="12" class="mr-2" />
                {{ activity.time }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center text-sm text-slate-600">
                <MapPin :size="14" class="mr-2 text-slate-400" />
                {{ activity.location }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div v-if="isRegistered(activity.id)" class="flex items-center">
                <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  Terdaftar
                </span>
              </div>
              <button 
                v-else
                @click="register(activity.id)" 
                :disabled="registeringId === activity.id"
                class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center"
              >
                <Loader2 v-if="registeringId === activity.id" :size="14" class="animate-spin mr-2" />
                Daftar Sekarang
              </button>
            </td>
          </tr>
          <tr v-if="activities.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500 italic">
              Belum ada kegiatan pembekalan yang tersedia saat ini.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-vue-next';

const activities = ref<any[]>([]);
const myRegistrations = ref<any[]>([]);
const registeringId = ref<number | null>(null);

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const [actRes, myRes] = await Promise.all([
      axios.get('/api/student/activities', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/student/my-registrations', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    activities.value = actRes.data;
    myRegistrations.value = myRes.data;
  } catch (err: any) {
    console.error('Fetch error:', err);
  }
};

const isRegistered = (activityId: number) => {
  return myRegistrations.value.some(reg => reg.activity_id === activityId);
};

const register = async (activityId: number) => {
  if (registeringId.value) return;
  registeringId.value = activityId;
  try {
    const token = localStorage.getItem('token');
    await axios.post('/api/student/register-activity', { activity_id: activityId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Pendaftaran berhasil!');
    await fetchData();
  } catch (err: any) {
    alert(err.response?.data?.error || 'Pendaftaran gagal');
  } finally {
    registeringId.value = null;
  }
};

onMounted(fetchData);
</script>
