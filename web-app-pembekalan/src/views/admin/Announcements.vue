<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Kelola Pengumuman</h2>
      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
        <Plus :size="20" />
        <span>Tambah Pengumuman</span>
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="ann in announcements" :key="ann.id" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-slate-900">{{ ann.title }}</h3>
            <p class="text-xs text-slate-500 mb-4">{{ formatDate(ann.created_at) }} {{ formatTime(ann.created_at) }}</p>
            <p class="text-slate-600 whitespace-pre-wrap">{{ ann.content }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="openModal(ann)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Pencil :size="18" />
            </button>
            <button @click="deleteAnnouncement(ann.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="announcements.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
        <p class="text-slate-500">Belum ada pengumuman.</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl w-full max-w-lg p-8">
        <h3 class="text-xl font-bold mb-6">{{ editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman' }}</h3>
        <form @submit.prevent="saveAnnouncement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Konten</label>
            <textarea v-model="form.content" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" rows="5"></textarea>
          </div>
          <div class="flex justify-end space-x-3 mt-8">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const announcements = ref<any[]>([]);
const showModal = ref(false);

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

const editingId = ref<number | null>(null);
const form = reactive({
  title: '',
  content: ''
});

const fetchAnnouncements = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/announcements', {
      headers: { Authorization: `Bearer ${token}` }
    });
    announcements.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const openModal = (ann: any = null) => {
  if (ann) {
    editingId.value = ann.id;
    form.title = ann.title;
    form.content = ann.content;
  } else {
    editingId.value = null;
    form.title = '';
    form.content = '';
  }
  showModal.value = true;
};

const saveAnnouncement = async () => {
  try {
    const token = localStorage.getItem('token');
    if (editingId.value) {
      await axios.put(`/api/admin/announcements/${editingId.value}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post('/api/admin/announcements', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    showModal.value = false;
    fetchAnnouncements();
  } catch (err) {
    console.error(err);
  }
};

const deleteAnnouncement = async (id: number) => {
  if (!confirm('Hapus pengumuman ini?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/admin/announcements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAnnouncements();
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.error || 'Gagal menghapus pengumuman');
  }
};

onMounted(fetchAnnouncements);
</script>
