<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-900">Evaluasi Akademik</h2>
      <div class="flex items-center space-x-4">
        <button @click="printReport" class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Printer :size="18" />
          <span>Cetak Laporan</span>
        </button>
      </div>
    </div>

    <div id="printable-area" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-8 hidden print:block">
        <h1 class="text-2xl font-bold text-center mb-2 uppercase">Laporan Evaluasi Akademik Pembekalan</h1>
        <p class="text-center text-slate-500 mb-8">Data Kelulusan Mahasiswa</p>
      </div>
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">NIM</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Nama Mahasiswa</th>
            <th class="px-6 py-4 font-semibold text-slate-700 text-center">Kehadiran (%)</th>
            <th class="px-6 py-4 font-semibold text-slate-700 text-center">Nilai Ujian</th>
            <th class="px-6 py-4 font-semibold text-slate-700 text-center">Status</th>
            <th class="px-6 py-4 font-semibold text-slate-700 text-center print:hidden">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="p in evaluations" :key="p.user_id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-mono text-sm text-slate-600">{{ p.nim }}</td>
            <td class="px-6 py-4 font-medium text-slate-900">{{ p.user_name }}</td>
            <td class="px-6 py-4">
              <div class="flex flex-col items-center">
                <div class="w-full bg-slate-100 rounded-full h-2 max-w-[100px] mb-1">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :class="getAttendanceColor(calculateAttendancePercentage(p.hadir_count))"
                    :style="{ width: `${calculateAttendancePercentage(p.hadir_count)}%` }"
                  ></div>
                </div>
                <span class="text-xs font-bold text-slate-600">{{ calculateAttendancePercentage(p.hadir_count) }}%</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center font-bold text-slate-700">{{ p.score ?? 0 }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="{
                'bg-emerald-100 text-emerald-700': p.status === 'Lulus',
                'bg-red-100 text-red-700': p.status === 'Mengulang'
              }" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {{ p.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center print:hidden">
              <div class="flex justify-center">
                <button 
                  @click="openEditModal(p)" 
                  class="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-bold"
                  title="Input Nilai Ujian"
                >
                  <Edit3 :size="14" />
                  <span>Input Nilai</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="evaluations.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500 italic">Data mahasiswa tidak ditemukan.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h3 class="text-xl font-bold mb-6">Input Nilai Ujian Pembekalan</h3>
        <div class="bg-slate-50 p-4 rounded-xl mb-6">
          <p class="text-xs text-slate-500 uppercase font-bold mb-1">Mahasiswa</p>
          <p class="font-bold text-slate-900">{{ selectedEvaluation?.user_name }}</p>
          <p class="text-sm text-slate-600">{{ selectedEvaluation?.nim }}</p>
        </div>
        
        <form @submit.prevent="updateEvaluation" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nilai Ujian Pembekalan</label>
            <input 
              v-model.number="form.score" 
              type="number" 
              min="0" 
              max="100" 
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
              placeholder="Masukkan nilai 0-100"
            >
            <p class="mt-2 text-[10px] text-slate-500 italic">
              * Mahasiswa lulus jika Nilai > 75 dan Kehadiran > 80%
            </p>
          </div>

          <div class="bg-indigo-50 p-4 rounded-xl">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-medium text-slate-600">Kehadiran Mahasiswa:</span>
              <span class="text-xs font-bold text-indigo-600">{{ calculateAttendancePercentage(selectedEvaluation?.hadir_count) }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-medium text-slate-600">Status Kelulusan:</span>
              <span :class="calculatedStatus === 'Lulus' ? 'text-emerald-600' : 'text-red-600'" class="text-xs font-bold uppercase">
                {{ calculatedStatus }}
              </span>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              @click="showModal = false" 
              class="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Nilai' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import { Printer, Edit3 } from 'lucide-vue-next';

const TOTAL_SESSIONS = 9;
const evaluations = ref<any[]>([]);
const showModal = ref(false);
const selectedEvaluation = ref<any>(null);
const isSubmitting = ref(false);

const form = reactive({
  score: 0
});

const calculateAttendancePercentage = (hadirCount: number) => {
  if (!hadirCount) return 0;
  return Math.round((hadirCount / TOTAL_SESSIONS) * 100);
};

const calculatedStatus = computed(() => {
  if (!selectedEvaluation.value) return 'Mengulang';
  const attendance = calculateAttendancePercentage(selectedEvaluation.value.hadir_count);
  if (form.score > 75 && attendance > 80) {
    return 'Lulus';
  }
  return 'Mengulang';
});

const fetchEvaluations = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/admin/evaluations', { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    evaluations.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const getAttendanceColor = (val: number) => {
  if (val > 80) return 'bg-emerald-500';
  if (val >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const openEditModal = (p: any) => {
  selectedEvaluation.value = p;
  form.score = p.score || 0;
  showModal.value = true;
};

const updateEvaluation = async () => {
  if (!selectedEvaluation.value) return;
  
  isSubmitting.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/admin/update-evaluation/${selectedEvaluation.value.user_id}`, {
      score: form.score,
      status: calculatedStatus.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showModal.value = false;
    fetchEvaluations();
  } catch (err) {
    console.error(err);
    alert('Gagal menyimpan nilai evaluasi');
  } finally {
    isSubmitting.value = false;
  }
};

const printReport = () => {
  window.print();
};

onMounted(fetchEvaluations);
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:block {
    display: block !important;
  }
}
</style>
