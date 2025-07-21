const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const vaccineLossService = {
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
          { field: { Name: "quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "details" } },
          { field: { Name: "report_date" } },
          { field: { Name: "training_completed" } }
        ],
        orderBy: [
          {
            fieldName: "report_date",
            sorttype: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords("vaccine_loss", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching vaccine losses:", error?.response?.data?.message);
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
          { field: { Name: "quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "details" } },
          { field: { Name: "report_date" } },
          { field: { Name: "training_completed" } }
        ]
      };
      
      const response = await apperClient.getRecordById("vaccine_loss", id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching vaccine loss with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(vaccineLossData) {
    await delay();
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [vaccineLossData]
      };
      
      const response = await apperClient.createRecord("vaccine_loss", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create vaccine loss ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
      
      throw new Error("No results returned from create operation");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating vaccine loss:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};