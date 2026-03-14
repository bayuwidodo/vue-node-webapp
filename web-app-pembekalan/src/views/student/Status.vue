<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <table class="w-full text-left border-collapse">
      <thead class="bg-slate-50 border-b border-slate-100">
        <tr>
          <th class="px-6 py-4 font-semibold text-slate-700 text-sm">Keterangan</th>
          <th class="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Kehadiran</th>
          <th class="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Nilai Ujian</th>
          <th class="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Status</th>
          <th class="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Sertifikat</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="evaluation" class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4">
            <p class="font-bold text-slate-900">Evaluasi Akademik Pembekalan</p>
            <p class="text-[10px] text-slate-500 mt-1">Akumulasi seluruh kegiatan</p>
          </td>
          <td class="px-6 py-4 text-center">
            <span :class="calculateAttendancePercentage(evaluation.hadir_count) >= 80 ? 'text-emerald-600' : 'text-amber-600'" class="font-bold text-sm">
              {{ calculateAttendancePercentage(evaluation.hadir_count) }}%
            </span>
          </td>
          <td class="px-6 py-4 text-center font-bold text-slate-700 text-sm">
            {{ evaluation.score ?? 0 }}
          </td>
          <td class="px-6 py-4 text-center">
            <span :class="{
              'bg-emerald-100 text-emerald-700': evaluation.status === 'Lulus',
              'bg-red-100 text-red-700': evaluation.status === 'Mengulang',
              'bg-amber-100 text-amber-700': evaluation.status === 'Belum Lulus'
            }" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {{ evaluation.status }}
            </span>
          </td>
          <td class="px-6 py-4 text-center">
            <button 
              v-if="evaluation.status === 'Lulus'"
              @click="downloadCertificate" 
              class="inline-flex items-center space-x-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download :size="14" />
              <span>Unduh</span>
            </button>
            <span v-else class="text-[10px] text-slate-400 italic">Belum tersedia</span>
          </td>
        </tr>
        <tr v-else>
          <td colspan="5" class="px-6 py-12 text-center text-slate-500 italic">
            Belum ada data evaluasi. Pastikan Anda sudah mendaftar kegiatan.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Download } from 'lucide-vue-next';
import { jsPDF } from 'jspdf';

const TOTAL_SESSIONS = 9;
const evaluation = ref<any>(null);
const profile = ref<any>({});

const calculateAttendancePercentage = (hadirCount: number) => {
  if (!hadirCount) return 0;
  return Math.round((hadirCount / TOTAL_SESSIONS) * 100);
};

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const [evalRes, profileRes] = await Promise.all([
      axios.get('/api/student/my-evaluation', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/student/profile', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    evaluation.value = evalRes.data;
    profile.value = profileRes.data;
  } catch (err) {
    console.error(err);
  }
};

const downloadCertificate = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Background
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 297, 210, 'F');

  // Border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186);

  // Content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(40);
  doc.text('SERTIFIKAT', 148.5, 50, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text('Diberikan kepada:', 148.5, 70, { align: 'center' });
  
  doc.setFontSize(30);
  doc.setTextColor(79, 70, 229);
  doc.text(profile.value.name, 148.5, 90, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIM: ${profile.value.nim}`, 148.5, 100, { align: 'center' });

  doc.text('Atas keberhasilannya menyelesaikan kegiatan:', 148.5, 120, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59);
  doc.text('PEMBEKALAN MAGANG', 148.5, 135, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`Tahun Akademik 2025/2026`, 148.5, 150, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text('STATUS: LULUS', 148.5, 170, { align: 'center' });

  doc.save(`Sertifikat_${profile.value.nim}_Pembekalan.pdf`);
};

onMounted(fetchData);
</script>
