import vaccineLossData from "@/services/mockData/vaccineLoss.json";

let vaccineLosses = [...vaccineLossData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const vaccineLossService = {
  async getAll() {
    await delay();
    return [...vaccineLosses];
  },

  async getById(id) {
    await delay();
    const vaccineLoss = vaccineLosses.find(v => v.Id === parseInt(id));
    return vaccineLoss ? { ...vaccineLoss } : null;
  },

  async create(vaccineLossData) {
    await delay();
    const newVaccineLoss = {
      ...vaccineLossData,
      Id: Math.max(...vaccineLosses.map(v => v.Id)) + 1,
      reportDate: new Date().toISOString().split("T")[0]
    };
    vaccineLosses.push(newVaccineLoss);
    return { ...newVaccineLoss };
  }
};