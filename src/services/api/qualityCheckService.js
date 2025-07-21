import qualityChecksData from "@/services/mockData/qualityChecks.json";

let qualityChecks = [...qualityChecksData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const qualityCheckService = {
  async getAll() {
    await delay();
    return [...qualityChecks];
  },

  async getById(id) {
    await delay();
    const qualityCheck = qualityChecks.find(q => q.Id === parseInt(id));
    return qualityCheck ? { ...qualityCheck } : null;
  },

  async create(qualityCheckData) {
    await delay();
    const newQualityCheck = {
      ...qualityCheckData,
      Id: Math.max(...qualityChecks.map(q => q.Id)) + 1,
      checkDate: new Date().toISOString().split("T")[0]
    };
    qualityChecks.push(newQualityCheck);
    return { ...newQualityCheck };
  },

  async getByVaccineId(vaccineId) {
    await delay();
    return qualityChecks
      .filter(check => check.vaccineId === vaccineId.toString())
      .map(check => ({ ...check }));
  }
};