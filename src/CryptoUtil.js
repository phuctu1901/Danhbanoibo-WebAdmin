export const CryptoUtil = {
  // Generate 32 bytes master key
  generateMasterKey: () => {
    const key = new Uint8Array(32);
    window.crypto.getRandomValues(key);
    return key;
  },

  // Base64 Helpers
  bytesToBase64: (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  },

  base64ToBytes: (base64) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  // Hash DeviceID
  hashDeviceId: async (deviceId) => {
    const enc = new TextEncoder();
    const data = enc.encode(deviceId);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  },

  // Generate Activation Code = DEK ^ SHA256(deviceId)
  generateActivationCode: async (dekBytes, deviceId) => {
    const hashedDeviceId = await CryptoUtil.hashDeviceId(deviceId);
    const activationBytes = new Uint8Array(32);
    
    for (let i = 0; i < 32; i++) {
      activationBytes[i] = dekBytes[i] ^ hashedDeviceId[i];
    }
    
    return CryptoUtil.bytesToBase64(activationBytes);
  },

  // Encrypt JSON Data
  encryptData: async (jsonData, dekBytes) => {
    const enc = new TextEncoder();
    const dataBytes = enc.encode(jsonData);
    
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      dekBytes,
      "AES-GCM",
      false,
      ["encrypt"]
    );
    
    // Swift AES.GCM uses 12 bytes Nonce
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      dataBytes
    );
    
    // Swift SealedBox.combined = Nonce (12) + Ciphertext + Tag (16)
    const combined = new Uint8Array(12 + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), 12);

    return combined;
  },

  // Khôi phục DEK từ mã kích hoạt + Device ID (giống hệt bước giải mã trên app iOS)
  recoverKey: async (activationCodeBase64, deviceId) => {
    const activationBytes = CryptoUtil.base64ToBytes(activationCodeBase64);
    if (activationBytes.length !== 32) throw new Error('Mã kích hoạt không đúng 32 byte');
    const hashedDeviceId = await CryptoUtil.hashDeviceId(deviceId);
    const dek = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      dek[i] = activationBytes[i] ^ hashedDeviceId[i];
    }
    return dek;
  },

  // Giải mã File.enc = Nonce(12) + Ciphertext + Tag(16)
  decryptData: async (combinedBytes, dekBytes) => {
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      dekBytes,
      "AES-GCM",
      false,
      ["decrypt"]
    );
    const iv = combinedBytes.slice(0, 12);
    const ctAndTag = combinedBytes.slice(12);
    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      ctAndTag
    );
    return new TextDecoder().decode(plainBuffer);
  }
};
