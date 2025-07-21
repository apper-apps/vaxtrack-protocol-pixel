const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const administrationService = {
  async getAll() {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "administration_date" } },
          { field: { Name: "administered_by" } }
        ]
      };
      
      const response = await apperClient.fetchRecords("administration", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching administrations:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getById(id) {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "administration_date" } },
          { field: { Name: "administered_by" } }
        ]
      };
      
      const response = await apperClient.getRecordById("administration", id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching administration with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(administrationData) {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [administrationData]
      };
      
      const response = await apperClient.createRecord("administration", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create administration ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
      
      throw new Error("No results returned from create operation");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating administration:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByVaccineId(vaccineId) {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "administration_date" } },
          { field: { Name: "administered_by" } }
        ],
        where: [
          {
            FieldName: "vaccine_id",
            Operator: "EqualTo",
            Values: [parseInt(vaccineId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords("administration", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching administrations by vaccine ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};