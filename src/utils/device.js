export const getDeviceId = () => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('todo_deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('todo_deviceId', deviceId);
    }
    return deviceId;
  }
  return '';
};