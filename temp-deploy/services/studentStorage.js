const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const fs = require('fs-extra');
const path = require('path');

class StudentStorageService {
  constructor() {
    this.containerName = 'student-records';
    this.blobServiceClient = null;
    this.containerClient = null;
    this.useLocalStorage = false;
    this.localStoragePath = path.join(__dirname, '../../uploads/student-records.json');
  }

  /**
   * Initialize Azure Blob Storage or fallback to local storage
   */
  async initialize() {
    try {
      // Try to initialize Azure Blob Storage
      const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      
      if (!storageAccountName) {
        console.log('⚠️  Azure Storage not configured, using local file storage');
        this.useLocalStorage = true;
        await this.initializeLocalStorage();
        return { success: true, mode: 'local' };
      }

      const accountUrl = `https://${storageAccountName}.blob.core.windows.net`;
      
      // Use DefaultAzureCredential for authentication (uses Azure CLI credentials)
      const credential = new DefaultAzureCredential();
      this.blobServiceClient = new BlobServiceClient(accountUrl, credential);
      
      // Get container client (create if doesn't exist)
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      try {
        await this.containerClient.createIfNotExists({
          access: 'container' // Public read access for blobs
        });
        console.log('✅ Azure Blob Storage initialized:', this.containerName);
        return { success: true, mode: 'azure' };
      } catch (error) {
        if (error.statusCode === 409) {
          // Container already exists
          console.log('✅ Azure Blob Storage connected:', this.containerName);
          return { success: true, mode: 'azure' };
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Azure Blob Storage initialization failed:', error.message);
      console.log('📂 Falling back to local file storage');
      this.useLocalStorage = true;
      await this.initializeLocalStorage();
      return { success: true, mode: 'local', error: error.message };
    }
  }

  /**
   * Initialize local JSON file storage
   */
  async initializeLocalStorage() {
    const dir = path.dirname(this.localStoragePath);
    await fs.ensureDir(dir);
    
    if (!await fs.pathExists(this.localStoragePath)) {
      await fs.writeJson(this.localStoragePath, []);
    }
  }

  /**
   * Store a student record
   */
  async storeRecord(record) {
    try {
      // Add unique ID and timestamp
      const studentRecord = {
        id: `${record.roll}_${Date.now()}`,
        ...record,
        timestamp: record.timestamp || new Date().toISOString()
      };

      if (this.useLocalStorage) {
        return await this.storeRecordLocally(studentRecord);
      } else {
        return await this.storeRecordInAzure(studentRecord);
      }
    } catch (error) {
      console.error('Error storing record:', error);
      throw new Error(`Failed to store record: ${error.message}`);
    }
  }

  /**
   * Store record in Azure Blob Storage
   */
  async storeRecordInAzure(record) {
    const blobName = `record_${record.id}.json`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    
    const content = JSON.stringify(record, null, 2);
    await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });

    console.log(`✅ Record stored in Azure Blob: ${blobName}`);
    return {
      success: true,
      id: record.id,
      blobName,
      url: blockBlobClient.url,
      storage: 'azure'
    };
  }

  /**
   * Store record in local JSON file
   */
  async storeRecordLocally(record) {
    const records = await fs.readJson(this.localStoragePath);
    records.push(record);
    await fs.writeJson(this.localStoragePath, records, { spaces: 2 });

    console.log(`✅ Record stored locally: ${record.id}`);
    return {
      success: true,
      id: record.id,
      storage: 'local'
    };
  }

  /**
   * List all student records
   */
  async listRecords() {
    try {
      if (this.useLocalStorage) {
        return await this.listRecordsLocally();
      } else {
        return await this.listRecordsFromAzure();
      }
    } catch (error) {
      console.error('Error listing records:', error);
      throw new Error(`Failed to list records: ${error.message}`);
    }
  }

  /**
   * List records from Azure Blob Storage
   */
  async listRecordsFromAzure() {
    const records = [];
    
    for await (const blob of this.containerClient.listBlobsFlat()) {
      if (blob.name.startsWith('record_') && blob.name.endsWith('.json')) {
        try {
          const blockBlobClient = this.containerClient.getBlockBlobClient(blob.name);
          const downloadResponse = await blockBlobClient.download(0);
          const content = await this.streamToString(downloadResponse.readableStreamBody);
          const record = JSON.parse(content);
          records.push(record);
        } catch (error) {
          console.error(`Error reading blob ${blob.name}:`, error.message);
        }
      }
    }

    // Sort by timestamp (newest first)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log(`✅ Retrieved ${records.length} records from Azure Blob Storage`);
    return records;
  }

  /**
   * List records from local storage
   */
  async listRecordsLocally() {
    const records = await fs.readJson(this.localStoragePath);
    
    // Sort by timestamp (newest first)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log(`✅ Retrieved ${records.length} records from local storage`);
    return records;
  }

  /**
   * Delete a specific record
   */
  async deleteRecord(recordId) {
    try {
      if (this.useLocalStorage) {
        return await this.deleteRecordLocally(recordId);
      } else {
        return await this.deleteRecordFromAzure(recordId);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Delete record from Azure Blob Storage
   */
  async deleteRecordFromAzure(recordId) {
    // Find the blob with this record ID
    for await (const blob of this.containerClient.listBlobsFlat()) {
      if (blob.name.includes(recordId)) {
        const blockBlobClient = this.containerClient.getBlockBlobClient(blob.name);
        await blockBlobClient.delete();
        console.log(`✅ Record deleted from Azure: ${blob.name}`);
        return { success: true, storage: 'azure' };
      }
    }
    
    throw new Error('Record not found');
  }

  /**
   * Delete record from local storage
   */
  async deleteRecordLocally(recordId) {
    const records = await fs.readJson(this.localStoragePath);
    const filteredRecords = records.filter(r => r.id !== recordId);
    
    if (records.length === filteredRecords.length) {
      throw new Error('Record not found');
    }
    
    await fs.writeJson(this.localStoragePath, filteredRecords, { spaces: 2 });
    console.log(`✅ Record deleted locally: ${recordId}`);
    return { success: true, storage: 'local' };
  }

  /**
   * Helper: Convert stream to string
   */
  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }

  /**
   * Get storage status
   */
  getStatus() {
    return {
      mode: this.useLocalStorage ? 'local' : 'azure',
      containerName: this.containerName,
      initialized: this.useLocalStorage || this.containerClient !== null
    };
  }
}

// Export singleton instance
module.exports = new StudentStorageService();
