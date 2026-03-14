<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Manajemen Peserta</h2>
      <div class="flex items-center space-x-4">
        <label class="text-sm text-slate-600">Filter Kegiatan:</label>
        <select v-model="filterActivity" class="px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">Semua Kegiatan</option>
          <option v-for="act in activities" :key="act.id" :value="act.name">{{ act.name }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">Mahasiswa</th>
            <th class="px-6 py-4 font-semibold text-slate-700">NIM</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Kegiatan</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Absensi</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="p in filteredParticipants" :key="p.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ p.user_name }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600 font-mono text-sm">{{ p.nim }}</td>
            <td class="px-6 py-4 text-slate-600">{{ p.activity_name }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-1">
                <button 
                  @click="updateAttendance(p, 'Hadir')" 
                  :class="p.attendance === 'Hadir' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'"
                  class="px-2 py-1 rounded text-[10px] font-bold transition-all"
                >
                  Hadir
                </button>
                <button 
                  @click="updateAttendance(p, 'Sakit')" 
                  :class="p.attendance === 'Sakit' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-50'"
                  class="px-2 py-1 rounded text-[10px] font-bold transition-all"
                >
                  Sakit
                </button>
                <button 
                  @click="updateAttendance(p, 'Alpha')" 
                  :class="p.attendance === 'Alpha' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-50'"
                  class="px-2 py-1 rounded text-[10px] font-bold transition-all"
                >
                  Alpha
                </button>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button @click="openEditModal(p)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Edit3 :size="18" />
                </button>
                <button @click="openDeleteModal(p)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="participants.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-slate-500">Belum ada peserta terdaftar.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl w-full max-w-md p-8">
        <h3 class="text-xl font-bold mb-6">Update Status Peserta</h3>
        <form @submit.prevent="updateParticipant" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Status Kehadiran</label>
            <select v-model="form.attendance" class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="Hadir">Hadir</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpha">Alpha</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 mt-8">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Simpan</button>
          </div>
        </form>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div class="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 :size="32" />
        </div>
        <h3 class="text-xl font-bold text-center mb-2">Hapus Pendaftaran?</h3>
        <p class="text-slate-600 text-center text-sm mb-8">
          Apakah Anda yakin ingin menghapus pendaftaran <strong>{{ participantToDelete?.user_name }}</strong>? 
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="flex flex-col space-y-3">
          <button 
            @click="confirmDelete" 
            :disabled="deleting"
            class="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Permanen' }}
          </button>
          <button 
            @click="showDeleteModal = false" 
            :disabled="deleting"
            class="w-full py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { Edit3, Trash2, X } from 'lucide-vue-next';

const participants = ref<any[]>([]);
const activities = ref<any[]>([]);
const filterActivity = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
const participantToDelete = ref<any>(null);
const deleting = ref(false);
const currentParticipantId = ref<number | null>(null);
const form = reactive({
  attendance: 'Hadir'
});

const filteredParticipants = computed(() => {
  if (!filterActivity.value) return participants.value;
  return participants.value.filter(p => p.activity_name === filterActivity.value);
});

const fetchParticipants = async () => {
  try {
    const token = localStorage.getItem('token');
    const [pRes, aRes] = await Promise.all([
      axios.get('/api/admin/participants', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/admin/activities', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    participants.value = pRes.data;
    activities.value = aRes.data;
  } catch (err) {
    console.error(err);
  }
};

const updateAttendance = async (p: any, value: string) => {
  try {
    const token = localStorage.getItem('token');
    
    await axios.put(`/api/admin/participants/${p.id}`, {
      attendance: value,
      score: p.score,
      status: p.status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    fetchParticipants();
  } catch (err) {
    console.error(err);
  }
};

const openEditModal = (p: any) => {
  currentParticipantId.value = p.id;
  form.attendance = p.attendance;
  showModal.value = true;
};

const updateParticipant = async () => {
  try {
    const token = localStorage.getItem('token');
    // We only update attendance now, but keep other fields as they are in DB
    const p = participants.value.find(part => part.id === currentParticipantId.value);
    await axios.put(`/api/admin/participants/${currentParticipantId.value}`, {
      attendance: form.attendance,
      score: p.score,
      status: p.status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showModal.value = false;
    fetchParticipants();
  } catch (err) {
    console.error(err);
  }
};

const openDeleteModal = (p: any) => {
  participantToDelete.value = p;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!participantToDelete.value || deleting.value) return;
  
  deleting.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/admin/participants/${participantToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showDeleteModal.value = false;
    fetchParticipants();
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.error || 'Gagal menghapus pendaftaran');
  } finally {
    deleting.value = false;
    participantToDelete.value = null;
  }
};

onMounted(fetchParticipants);
</script>
