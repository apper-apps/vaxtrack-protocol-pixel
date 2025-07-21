const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const qualityCheckService = {
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
          { field: { Name: "doses_passed" } },
          { field: { Name: "doses_failed" } },
          { field: { Name: "discrepancy_reason" } },
          { field: { Name: "check_date" } }
        ]
      };
      
      const response = await apperClient.fetchRecords("quality_check", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching quality checks:", error?.response?.data?.message);
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
          { field: { Name: "doses_passed" } },
          { field: { Name: "doses_failed" } },
          { field: { Name: "discrepancy_reason" } },
          { field: { Name: "check_date" } }
        ]
      };
      
      const response = await apperClient.getRecordById("quality_check", id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching quality check with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(qualityCheckData) {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [qualityCheckData]
      };
      
      const response = await apperClient.createRecord("quality_check", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create quality check ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
      
      throw new Error("No results returned from create operation");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating quality check:", error?.response?.data?.message);
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
          { field: { Name: "doses_passed" } },
          { field: { Name: "doses_failed" } },
          { field: { Name: "discrepancy_reason" } },
          { field: { Name: "check_date" } }
        ],
        where: [
          {
            FieldName: "vaccine_id",
            Operator: "EqualTo",
            Values: [parseInt(vaccineId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords("quality_check", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching quality checks by vaccine ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};