import administrationsData from "@/services/mockData/administrations.json";

let administrations = [...administrationsData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const administrationService = {
  async getAll() {
    await delay();
    return [...administrations];
  },

  async getById(id) {
    await delay();
    const administration = administrations.find(a => a.Id === parseInt(id));
    return administration ? { ...administration } : null;
  },

  async create(administrationData) {
    await delay();
    const newAdministration = {
      ...administrationData,
      Id: Math.max(...administrations.map(a => a.Id)) + 1,
      administrationDate: new Date().toISOString().split("T")[0]
    };
    administrations.push(newAdministration);
    return { ...newAdministration };
  },

  async getByVaccineId(vaccineId) {
    await delay();
    return administrations
      .filter(admin => admin.vaccineId === vaccineId.toString())
      .map(admin => ({ ...admin }));
  }
};