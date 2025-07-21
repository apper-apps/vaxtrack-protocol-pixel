import vaccinesData from "@/services/mockData/vaccines.json";

let vaccines = [...vaccinesData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const vaccineService = {
  async getAll() {
    await delay();
    return [...vaccines];
  },

  async getById(id) {
    await delay();
    const vaccine = vaccines.find(v => v.Id === parseInt(id));
    return vaccine ? { ...vaccine } : null;
  },

  async create(vaccineData) {
    await delay();
    const newVaccine = {
      ...vaccineData,
      Id: Math.max(...vaccines.map(v => v.Id)) + 1,
      administeredDoses: 0
    };
    vaccines.push(newVaccine);
    return { ...newVaccine };
  },

  async update(id, updates) {
    await delay();
    const index = vaccines.findIndex(v => v.Id === parseInt(id));
    if (index !== -1) {
      vaccines[index] = { ...vaccines[index], ...updates };
      return { ...vaccines[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = vaccines.findIndex(v => v.Id === parseInt(id));
    if (index !== -1) {
      const deleted = vaccines.splice(index, 1)[0];
      return { ...deleted };
    }
    return null;
  },

  async updateAdministeredDoses(id, dosesAdministered) {
    await delay();
    const vaccine = vaccines.find(v => v.Id === parseInt(id));
    if (vaccine) {
      vaccine.administeredDoses = (vaccine.administeredDoses || 0) + dosesAdministered;
      vaccine.quantityOnHand = Math.max(0, vaccine.quantityOnHand - dosesAdministered);
      return { ...vaccine };
    }
    return null;
  },

  async getExpiringVaccines(daysFromNow = 30) {
    await delay();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    
    return vaccines
      .filter(vaccine => {
        const expirationDate = new Date(vaccine.expirationDate);
        return expirationDate <= cutoffDate && vaccine.quantityOnHand > 0;
      })
      .map(vaccine => ({ ...vaccine }));
  },

  async getLowStockVaccines(threshold = 5) {
    await delay();
    return vaccines
      .filter(vaccine => vaccine.quantityOnHand <= threshold && vaccine.quantityOnHand > 0)
      .map(vaccine => ({ ...vaccine }));
  }
};