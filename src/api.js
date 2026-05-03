const API_URL = "https://script.google.com/macros/s/AKfycbxhi9DwXHHUvlLwILY7AyVmzskaI83zEcnxinVamk9_qGyg40WJglHD2Y-LX4l3k7vbAg/exec";

export const GSheets = {
  // Ambil data awal (Menu, Akun, Shift)
  init: async () => {
    try {
      const res = await fetch(`${API_URL}?action=init`);
      return await res.json();
    } catch (err) {
      console.error("Gagal Load Data:", err);
      return { status: "ERROR" };
    }
  },

  // Simpan Transaksi ke Sheet Orders
  saveOrder: async (orderData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        redirect: "follow", // WAJIB untuk Google Script
        body: JSON.stringify({ action: "saveOrder", ...orderData })
      });
      return await res.json();
    } catch (err) {
      console.error("Gagal Simpan Order:", err);
      return { status: "ERROR" };
    }
  },

  // Update Status Shift (Open/Close)
  updateShift: async (shiftAction) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify({ action: shiftAction }) // closeShift atau openShift
      });
      return await res.json();
    } catch (err) {
      return { status: "ERROR" };
    }
  }
};
